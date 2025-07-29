// Debug script for player count testing
console.log('Debug script loaded');

// Function to check player count
function checkPlayerCount() {
  if (window.gameManager) {
    console.log('GameManager found:', window.gameManager);
    console.log('Current game state:', window.gameManager.getGameState());
    
    if (window.gameManager.view && window.gameManager.view.model) {
      console.log('Model found:', window.gameManager.view.model);
      console.log('Connected players:', window.gameManager.view.model.getConnectedPlayers?.());
      console.log('Player count:', window.gameManager.view.model.getPlayerCount?.());
    }
  } else {
    console.log('GameManager not found');
  }
}

// Function to manually trigger player count update
function triggerPlayerCountUpdate() {
  if (window.gameManager) {
    console.log('Triggering manual player count update');
    window.gameManager.triggerPlayerCountUpdate();
  } else {
    console.log('GameManager not found');
  }
}

// Expose functions to window
window.checkPlayerCount = checkPlayerCount;
window.triggerPlayerCountUpdate = triggerPlayerCountUpdate;

console.log('Debug functions available:');
console.log('- checkPlayerCount()');
console.log('- triggerPlayerCountUpdate()'); 