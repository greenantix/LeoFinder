# LeoFinder Deployment Guide

## Backend Environment Variables (Render)

Add these environment variables to your Render service:

### Required Firebase Variables:
```
FIREBASE_PROJECT_ID=leofinder-cc420
FIREBASE_PRIVATE_KEY_ID=c23699059a47f813a220f2d5c42d88eac020dd60
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@leofinder-cc420.iam.gserviceaccount.com
```

### Firebase Private Key:
```
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5vpxmARkNLvIH
MF748nRziqySuWml2gpzDgk9YCZ5T288siFIzfJKee0DExhWu0pe2RltZAZzKtTO
zw+U+o17+soUmjP2oHuc75NqlK0X3N2s+HOLnBJtnXCgYWaJKTywtVtcNudH9Nsa
fasAbQ3KI/HZswoftQUhKVTaS7fm6wfy2/27Pa2fb+YQr1RryHIA8WL7cn3oYkV2
8lKw5SqfignjmC2Ks1P21itKEIprr0jlhUz359ideRvAKg68RaeD9ox6Hf8Y8/zF
OSHjYRLL0nb16KU2o6rC/RfkyJbbLfr+sD9pKQVTdcnzTyuWzHhpYF+CbFJiCbAi
e1ViHu0/AgMBAAECggEANcanxSiANj7nN4mblXusl18Iw5oGqkvMRq9DoY9a1DhZ
PjtcQ5XMlh9irUcz/rhOudMk93TEIUe/QPjVzA4WNFTReNGERd0ErNT32x2cV5JM
Y62y1jKjazTvzJ8mboOP3KFFCBelMkIDxVGo1oC8Q0/Qz3R0c+WWzJkIxgKyBZp7
cVWTi0CcMhj4aT53cL/QGS4gGwAx29VT5NHq5P++Jk48nuabHyF8tPzm40AD0QY/
wtK41Zs7fZmhXoy1M490K0tvQGuTltZnJ9kV1U2uc0Pgo3LaTDE+/v4yQzvAjZ7j
wojakJNatISEFSGdZDKd07a70KEGgFl8Hq8lfba0cQKBgQDu77JQXyGR5J73Cgto
FM4IdpOhEG0qx8OIMjLDetCEfTqvUXTAOuCtuhUQIRm+UEd/6Z1WEJBwbdddAId5
sElv91f0Z/BIV21EtFHCjXDuEZGGiCMmKGCsJLvhbzlLL9k/8YQ1fEnyvk8H5ss4
k2fcagt0KDl2kVqUH5yhceA8MwKBgQDHAnKMx1D6Xhv/RIDjayVAe+ZOwsh9ksZN
TwgmqWcmxHr5ku5t9oYLC1MJ8SX6eqHRVa0ksQxSZgRcEIhwEyCRiCU9AD/0hHX9
JHbTQUZOwZ2vfJe7/8b8WSiqxOucmob72TgPFkQxQ/dWp/ndE9pzDslBR2gAoVOn
P3WmkdL+xQKBgQCgvZ5vFWCnHm+W8Cn2TjDBXsw4Sa23XwZ7BJJEEcZfq0OkmB78
B2AJX6s1257O+oDvW4FeWexhxnNg/K8nPWJaMcL5CEeM00wOMWTjhnXXovgM0l8b
F4TZqii/Iy0fGMSFkPwJY2D4LfFK9of2uqvfi3PDJCBsVKLkDVQ5BDv/IwKBgFxv
5ZdAaXuxxN1gC2IW/ZmjM0m4Lfot99Am+olCvHgEYX6VYgxPqtlsbCi9Cz/6QDmE
y0S0vB1152aAA2/TYphWnb1k5VAFSuzHSC4+LpMcWcsOW0hmuR2zqDESAMKgADzx
G5neZNRhVny4z1WCCEDTSGX67fME/F8+Gb7CEzhlAoGAMsaDLEv8XW6i6gyKYM8P
1uSxAzXO+CkBBC2vNdUYK793vntlrvW0f/H54G/CE1hAJ8heuGUq0odm7QfFUnSj
c7Ke2UK/pkpZhtKj85ylSQldXjW4bYisqCCPIgY2Qrs6tVLtZK56lAM6Qmc4JwSH
yZbxxEH/TlhrXNpyapQSLq0=
-----END PRIVATE KEY-----
```

### Additional APIs:
```
ANTHROPIC_API_KEY=your_anthropic_key
FORECLOSURE_USER=your_foreclosure_user
FORECLOSURE_PASS=your_foreclosure_pass
```

## Current Status

✅ **Frontend**: https://leofinder.netlify.app - Navigation working  
✅ **Backend**: https://leofinder-backend.onrender.com - Fallback data enabled  
✅ **Database**: Firebase Firestore with sample listings  

## Testing

1. Backend Health: `curl https://leofinder-backend.onrender.com/health`
2. Listings API: `curl https://leofinder-backend.onrender.com/api/listings`
3. Frontend: Visit https://leofinder.netlify.app and test navigation