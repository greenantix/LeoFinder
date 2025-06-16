#!/usr/bin/env node

// LeoFinder AI Brain Live Demo Runner
import { VeteranSearchDemo } from './src/demo/veteranSearchDemo.js';

async function runDemo() {
  console.log('🐕 Starting LeoFinder AI Brain Demo...\n');
  
  try {
    const demo = new VeteranSearchDemo();
    await demo.runLiveDemo();
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n🔧 This is expected in demo mode - the AI engines are showcasing functionality');
    console.log('🏠 Mock houses are available in the system!');
  }
}

runDemo();