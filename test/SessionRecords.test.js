const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SessionRecords", function () {
  let SessionRecords;
  let sessionRecords;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    SessionRecords = await ethers.getContractFactory("SessionRecords");
    sessionRecords = await SessionRecords.deploy();
    await sessionRecords.waitForDeployment();
  });

  describe("Player Registration", function () {
    it("Should register a new player", async function () {
      await sessionRecords.connect(player1).registerPlayer("TestPlayer");
      
      const stats = await sessionRecords.getPlayerStats(player1.address);
      expect(stats.isRegistered).to.be.true;
      expect(stats.nickname).to.equal("TestPlayer");
    });

    it("Should not allow duplicate registration", async function () {
      await sessionRecords.connect(player1).registerPlayer("TestPlayer");
      
      await expect(
        sessionRecords.connect(player1).registerPlayer("AnotherName")
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("Session Recording", function () {
    beforeEach(async function () {
      await sessionRecords.connect(player1).registerPlayer("TestPlayer");
    });

    it("Should record a session successfully", async function () {
      await expect(
        sessionRecords.connect(player1).recordSession(100, 300, 25, 50)
      ).to.emit(sessionRecords, "SessionCompleted");
    });

    it("Should not allow unregistered players to record sessions", async function () {
      await expect(
        sessionRecords.connect(player2).recordSession(100, 300, 25, 50)
      ).to.be.revertedWith("Player not registered");
    });

    it("Should validate session parameters", async function () {
      // Invalid score
      await expect(
        sessionRecords.connect(player1).recordSession(0, 300, 25, 50)
      ).to.be.revertedWith("Score must be positive");

      // Invalid duration
      await expect(
        sessionRecords.connect(player1).recordSession(100, 0, 25, 50)
      ).to.be.revertedWith("Duration must be positive");

      // Session too long
      await expect(
        sessionRecords.connect(player1).recordSession(100, 4000, 25, 50)
      ).to.be.revertedWith("Session too long");
    });
  });

  describe("Dynamic Score Calculation", function () {
    beforeEach(async function () {
      await sessionRecords.connect(player1).registerPlayer("TestPlayer");
    });

    it("Should calculate dynamic score with bonuses", async function () {
      // Record multiple sessions to trigger consecutive bonus
      for (let i = 0; i < 5; i++) {
        await sessionRecords.connect(player1).recordSession(100, 300, 25, 50);
      }

      const stats = await sessionRecords.getPlayerStats(player1.address);
      expect(stats.totalSessions).to.equal(5);
      expect(stats.consecutiveSessions).to.equal(5);
    });
  });

  describe("Achievements", function () {
    beforeEach(async function () {
      await sessionRecords.connect(player1).registerPlayer("TestPlayer");
    });

    it("Should award FIRST_BLOOD achievement", async function () {
      await sessionRecords.connect(player1).recordSession(100, 300, 25, 50);
      
      const achievements = await sessionRecords.getPlayerAchievements(player1.address);
      expect(achievements).to.include("FIRST_BLOOD");
    });

    it("Should award SCORE_MASTER achievement", async function () {
      await sessionRecords.connect(player1).recordSession(150, 300, 25, 50);
      
      const achievements = await sessionRecords.getPlayerAchievements(player1.address);
      expect(achievements).to.include("SCORE_MASTER");
    });
  });

  describe("Leaderboard", function () {
    beforeEach(async function () {
      await sessionRecords.connect(player1).registerPlayer("Player1");
      await sessionRecords.connect(player2).registerPlayer("Player2");
    });

    it("Should update leaderboard after sessions", async function () {
      await sessionRecords.connect(player1).recordSession(100, 300, 25, 50);
      await sessionRecords.connect(player2).recordSession(200, 300, 25, 50);
      
      const [players, scores] = await sessionRecords.getLeaderboard();
      expect(players.length).to.be.greaterThan(0);
      expect(scores.length).to.be.greaterThan(0);
    });
  });
}); 