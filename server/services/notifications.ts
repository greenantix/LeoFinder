import admin from 'firebase-admin';
import { Listing } from '../types/index';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

export class NotificationService {
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      if (admin.apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n").trim();

        if (!projectId || !privateKey || !clientEmail) {
          throw new Error("FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY must be set.");
        }
        
        const firebaseParams = {
          projectId,
          clientEmail,
          privateKey,
        };

        admin.initializeApp({
          credential: admin.credential.cert(firebaseParams),
        });

        this.initialized = true;
        console.log('Firebase Admin initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      this.initialized = false;
    }
  }

  async sendNewListingNotification(listing: Listing): Promise<boolean> {
    if (!this.initialized) {
      console.log('Firebase not initialized, skipping notification');
      return false;
    }

    try {
      const payload: NotificationPayload = {
        title: '🏠 New High-Score Property Found!',
        body: `${listing.address} - $${listing.price.toLocaleString()} (Score: ${listing.match_score}/100)`,
        data: {
          listingId: listing.id,
          address: listing.address,
          price: listing.price.toString(),
          score: listing.match_score.toString(),
          source: listing.source,
          url: listing.url,
          type: 'new_listing'
        },
        imageUrl: listing.images[0] || undefined
      };

      // For now, send to a topic that users can subscribe to
      // In a full implementation, you'd send to specific user tokens
      const topic = 'high_score_listings';
      
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: payload.data || {},
        topic: topic,
        android: {
          notification: {
            channelId: 'leofinder_listings',
            priority: 'high' as const,
            sound: 'default',
            tag: listing.id
          },
          data: payload.data || {}
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body
              },
              badge: 1,
              sound: 'default'
            }
          }
        },
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            image: payload.imageUrl,
            data: payload.data || {}
          },
          fcmOptions: {
            link: `/listing/${listing.id}`
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendCustomNotification(
    tokens: string[] | string, 
    payload: NotificationPayload
  ): Promise<boolean> {
    if (!this.initialized) {
      console.log('Firebase not initialized, skipping notification');
      return false;
    }

    try {
      const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
      
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl
        },
        data: payload.data || {},
        tokens: tokensArray
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('Custom notification sent:', response.responses.length, 'messages sent');
      
      // Log any failures
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokensArray[idx]}:`, resp.error);
          }
        });
      }

      return response.successCount > 0;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return false;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      await admin.messaging().subscribeToTopic([token], topic);
      console.log(`Token subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      await admin.messaging().unsubscribeFromTopic([token], topic);
      console.log(`Token unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  async sendPriceDropAlert(listing: Listing, previousPrice: number): Promise<boolean> {
    const priceDrop = previousPrice - listing.price;
    const percentageDrop = ((priceDrop / previousPrice) * 100).toFixed(1);

    const payload: NotificationPayload = {
      title: '📉 Price Drop Alert!',
      body: `${listing.address} dropped by $${priceDrop.toLocaleString()} (${percentageDrop}%)`,
      data: {
        listingId: listing.id,
        type: 'price_drop',
        previousPrice: previousPrice.toString(),
        newPrice: listing.price.toString(),
        percentageDrop: percentageDrop
      }
    };

    return await this.sendNewListingNotification(listing);
  }

  async sendMatchScoreUpdate(listing: Listing, previousScore: number): Promise<boolean> {
    if (listing.match_score > previousScore && listing.match_score >= 70) {
      const payload: NotificationPayload = {
        title: '⭐ Score Increased!',
        body: `${listing.address} score improved to ${listing.match_score}/100`,
        data: {
          listingId: listing.id,
          type: 'score_update',
          previousScore: previousScore.toString(),
          newScore: listing.match_score.toString()
        }
      };

      return await this.sendNewListingNotification(listing);
    }
    
    return false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const notificationService = new NotificationService();