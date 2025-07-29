// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SessionRecords is Ownable, ReentrancyGuard {
    // ============ EVENTS ============
    event SessionCompleted(
        address indexed player,
        uint256 indexed sessionId,
        uint256 score,
        uint256 duration,
        uint256 timestamp,
        bool isMonadTestnet
    );
    
    event PlayerRegistered(address indexed player, string nickname);
    event AchievementUnlocked(address indexed player, string achievement);
    event LeaderboardUpdated(address indexed player, uint256 newRank);

    // ============ STRUCTS ============
    struct Session {
        uint256 sessionId;
        address player;
        uint256 score;
        uint256 duration;
        uint256 timestamp;
        bool isMonadTestnet;
        uint256 orbCount;
        uint256 snakeLength;
    }
    
    struct PlayerStats {
        uint256 totalSessions;
        uint256 totalScore;
        uint256 bestScore;
        uint256 totalDuration;
        uint256 consecutiveSessions;
        uint256 lastSessionTime;
        string nickname;
        bool isRegistered;
        uint256 achievements;
        uint256 totalKills;
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 totalScore;
        uint256 rank;
        uint256 lastUpdated;
    }

    // ============ STATE VARIABLES ============
    mapping(address => Session[]) public playerSessions;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => mapping(string => bool)) public playerAchievements;
    mapping(uint256 => address) public sessionToPlayer;
    
    // Leaderboard tracking
    address[] public leaderboardPlayers;
    mapping(address => uint256) public playerRank;
    
    // Configuration
    uint256 public sessionCounter;
    uint256 public constant MONAD_TESTNET_CHAIN_ID = 10143;
    uint256 public constant SESSION_BONUS_MULTIPLIER = 110; // 10% bonus
    uint256 public constant CONSECUTIVE_BONUS_MULTIPLIER = 120; // 20% bonus
    uint256 public constant DAILY_STREAK_BONUS = 5; // 5% per day
    
    // ============ MODIFIERS ============
    modifier onlyRegisteredPlayer() {
        require(playerStats[msg.sender].isRegistered, "Player not registered");
        _;
    }
    
    modifier validSession(uint256 _score, uint256 _duration) {
        require(_score > 0, "Score must be positive");
        require(_duration > 0, "Duration must be positive");
        require(_duration <= 3600, "Session too long"); // Max 1 hour
        _;
    }

    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Register a new player
     * @param _nickname Player's nickname
     */
    function registerPlayer(string memory _nickname) external {
        require(!playerStats[msg.sender].isRegistered, "Already registered");
        require(bytes(_nickname).length > 0, "Nickname required");
        require(bytes(_nickname).length <= 32, "Nickname too long");
        
        playerStats[msg.sender] = PlayerStats({
            totalSessions: 0,
            totalScore: 0,
            bestScore: 0,
            totalDuration: 0,
            consecutiveSessions: 0,
            lastSessionTime: 0,
            nickname: _nickname,
            isRegistered: true,
            achievements: 0,
            totalKills: 0
        });
        
        emit PlayerRegistered(msg.sender, _nickname);
    }
    
    /**
     * @dev Record a completed game session
     * @param _score Base score from the game
     * @param _duration Session duration in seconds
     * @param _orbCount Number of orbs collected
     * @param _snakeLength Final snake length
     * @param _isKill Whether this is a kill event (true) or death event (false)
     */
    function recordSession(
        uint256 _score,
        uint256 _duration,
        uint256 _orbCount,
        uint256 _snakeLength,
        bool _isKill
    ) external onlyRegisteredPlayer validSession(_score, _duration) nonReentrant {
        uint256 sessionId = ++sessionCounter;
        bool isMonadTestnet = block.chainid == MONAD_TESTNET_CHAIN_ID;
        
        // Calculate dynamic score with bonuses
        uint256 dynamicScore = calculateDynamicScore(_score, _duration, _orbCount, isMonadTestnet);
        
        // Create session record
        Session memory newSession = Session({
            sessionId: sessionId,
            player: msg.sender,
            score: dynamicScore,
            duration: _duration,
            timestamp: block.timestamp,
            isMonadTestnet: isMonadTestnet,
            orbCount: _orbCount,
            snakeLength: _snakeLength
        });
        
        // Update player stats
        updatePlayerStats(msg.sender, dynamicScore, _duration, _isKill);
        
        // Store session
        playerSessions[msg.sender].push(newSession);
        sessionToPlayer[sessionId] = msg.sender;
        
        // Update leaderboard
        updateLeaderboard(msg.sender, dynamicScore);
        
        // Check for achievements
        checkAchievements(msg.sender, dynamicScore, _orbCount, _snakeLength);
        
        emit SessionCompleted(
            msg.sender,
            sessionId,
            dynamicScore,
            _duration,
            block.timestamp,
            isMonadTestnet
        );
    }
    
    // ============ SCORE CALCULATION ============
    
    /**
     * @dev Calculate dynamic score with various bonuses
     */
    function calculateDynamicScore(
        uint256 _baseScore,
        uint256 _duration,
        uint256 _orbCount,
        bool _isMonadTestnet
    ) internal view returns (uint256) {
        uint256 dynamicScore = _baseScore;
        
        // Monad testnet bonus (10%)
        if (_isMonadTestnet) {
            dynamicScore = (dynamicScore * SESSION_BONUS_MULTIPLIER) / 100;
        }
        
        // Consecutive sessions bonus (20% after 5 sessions)
        PlayerStats memory stats = playerStats[msg.sender];
        if (stats.consecutiveSessions >= 5) {
            dynamicScore = (dynamicScore * CONSECUTIVE_BONUS_MULTIPLIER) / 100;
        }
        
        // Daily streak bonus (5% per day, max 50%)
        uint256 dailyStreak = calculateDailyStreak(msg.sender);
        if (dailyStreak > 0) {
            uint256 streakBonus = (dailyStreak * DAILY_STREAK_BONUS);
            if (streakBonus > 50) streakBonus = 50; // Cap at 50%
            dynamicScore = (dynamicScore * (100 + streakBonus)) / 100;
        }
        
        // Orb efficiency bonus
        if (_orbCount > 0 && _duration > 0) {
            uint256 orbRate = (_orbCount * 60) / _duration; // orbs per minute
            if (orbRate >= 2) { // 2+ orbs per minute
                dynamicScore = (dynamicScore * 105) / 100; // 5% bonus
            }
        }
        
        return dynamicScore;
    }
    
    // ============ PLAYER STATS MANAGEMENT ============
    
    /**
     * @dev Update player statistics after session completion
     */
    function updatePlayerStats(
        address _player,
        uint256 _score,
        uint256 _duration,
        bool _isKill
    ) internal {
        PlayerStats storage stats = playerStats[_player];
        
        // Update basic stats
        stats.totalSessions++;
        stats.totalScore += _score;
        stats.totalDuration += _duration;
        
        // Update kills if this is a kill event
        if (_isKill) {
            stats.totalKills++;
        }
        
        // Update best score
        if (_score > stats.bestScore) {
            stats.bestScore = _score;
        }
        
        // Update consecutive sessions
        uint256 timeSinceLastSession = block.timestamp - stats.lastSessionTime;
        if (timeSinceLastSession <= 86400) { // Within 24 hours
            stats.consecutiveSessions++;
        } else {
            stats.consecutiveSessions = 1;
        }
        
        stats.lastSessionTime = block.timestamp;
    }
    
    // ============ LEADERBOARD MANAGEMENT ============
    
    /**
     * @dev Update leaderboard with new score
     */
    function updateLeaderboard(address _player, uint256 /* _newScore */) internal {
        uint256 currentRank = playerRank[_player];
        
        // If player not in leaderboard, add them
        if (currentRank == 0) {
            leaderboardPlayers.push(_player);
            currentRank = leaderboardPlayers.length;
            playerRank[_player] = currentRank;
        }
        
        // Sort leaderboard
        sortLeaderboard();
        
        emit LeaderboardUpdated(_player, playerRank[_player]);
    }
    
    /**
     * @dev Sort leaderboard by total score
     */
    function sortLeaderboard() internal {
        // Simple bubble sort for small leaderboard
        // For production, consider more efficient algorithms
        for (uint256 i = 0; i < leaderboardPlayers.length - 1; i++) {
            for (uint256 j = 0; j < leaderboardPlayers.length - i - 1; j++) {
                address player1 = leaderboardPlayers[j];
                address player2 = leaderboardPlayers[j + 1];
                
                if (playerStats[player1].totalScore < playerStats[player2].totalScore) {
                    // Swap players
                    leaderboardPlayers[j] = player2;
                    leaderboardPlayers[j + 1] = player1;
                    
                    // Update ranks
                    playerRank[player1] = j + 2;
                    playerRank[player2] = j + 1;
                }
            }
        }
    }
    
    // ============ ACHIEVEMENT SYSTEM ============
    
    /**
     * @dev Check and award achievements
     */
    function checkAchievements(
        address _player,
        uint256 _score,
        uint256 _orbCount,
        uint256 _snakeLength
    ) internal {
        PlayerStats memory stats = playerStats[_player];
        
        // First Blood - First session
        if (stats.totalSessions == 1) {
            awardAchievement(_player, "FIRST_BLOOD");
        }
        
        // Score Master - Score 100+ points
        if (_score >= 100 && !playerAchievements[_player]["SCORE_MASTER"]) {
            awardAchievement(_player, "SCORE_MASTER");
        }
        
        // Orb Collector - Collect 50+ orbs in one session
        if (_orbCount >= 50 && !playerAchievements[_player]["ORB_COLLECTOR"]) {
            awardAchievement(_player, "ORB_COLLECTOR");
        }
        
        // Snake Master - Reach length 100+
        if (_snakeLength >= 100 && !playerAchievements[_player]["SNAKE_MASTER"]) {
            awardAchievement(_player, "SNAKE_MASTER");
        }
        
        // Monad Loyalist - Play 10+ sessions on Monad testnet
        if (stats.totalSessions >= 10 && !playerAchievements[_player]["MONAD_LOYALIST"]) {
            awardAchievement(_player, "MONAD_LOYALIST");
        }
        
        // Streak Master - 7+ consecutive days
        uint256 dailyStreak = calculateDailyStreak(_player);
        if (dailyStreak >= 7 && !playerAchievements[_player]["STREAK_MASTER"]) {
            awardAchievement(_player, "STREAK_MASTER");
        }
    }
    
    /**
     * @dev Award achievement to player
     */
    function awardAchievement(address _player, string memory _achievement) internal {
        if (!playerAchievements[_player][_achievement]) {
            playerAchievements[_player][_achievement] = true;
            playerStats[_player].achievements++;
            emit AchievementUnlocked(_player, _achievement);
        }
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @dev Calculate daily streak for player
     */
    function calculateDailyStreak(address _player) internal view returns (uint256) {
        // Implementation would track daily sessions
        // For simplicity, returning consecutive sessions
        return playerStats[_player].consecutiveSessions;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get player's session history
     */
    function getPlayerSessions(address _player) external view returns (Session[] memory) {
        return playerSessions[_player];
    }
    
    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address _player) external view returns (PlayerStats memory) {
        return playerStats[_player];
    }
    
    /**
     * @dev Get leaderboard
     */
    function getLeaderboard() external view returns (address[] memory, uint256[] memory) {
        address[] memory players = new address[](leaderboardPlayers.length);
        uint256[] memory scores = new uint256[](leaderboardPlayers.length);
        
        for (uint256 i = 0; i < leaderboardPlayers.length; i++) {
            players[i] = leaderboardPlayers[i];
            scores[i] = playerStats[leaderboardPlayers[i]].totalScore;
        }
        
        return (players, scores);
    }
    
    /**
     * @dev Get player's achievements
     */
    function getPlayerAchievements(address _player) external view returns (string[] memory) {
        // Count achievements first
        uint256 achievementCount = 0;
        string[] memory allAchievements = new string[](10); // Max 10 achievements
        
        if (playerAchievements[_player]["FIRST_BLOOD"]) allAchievements[achievementCount++] = "FIRST_BLOOD";
        if (playerAchievements[_player]["SCORE_MASTER"]) allAchievements[achievementCount++] = "SCORE_MASTER";
        if (playerAchievements[_player]["ORB_COLLECTOR"]) allAchievements[achievementCount++] = "ORB_COLLECTOR";
        if (playerAchievements[_player]["SNAKE_MASTER"]) allAchievements[achievementCount++] = "SNAKE_MASTER";
        if (playerAchievements[_player]["MONAD_LOYALIST"]) allAchievements[achievementCount++] = "MONAD_LOYALIST";
        if (playerAchievements[_player]["STREAK_MASTER"]) allAchievements[achievementCount++] = "STREAK_MASTER";
        
        // Create properly sized array
        string[] memory result = new string[](achievementCount);
        for (uint256 i = 0; i < achievementCount; i++) {
            result[i] = allAchievements[i];
        }
        
        return result;
    }
} 