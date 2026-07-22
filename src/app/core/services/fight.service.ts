import { Injectable } from '@angular/core';
import { Fight } from '../models/fight.model';
import { Fighter } from '../models/fighter.model';
import { FIGHTS } from '../../data/fights.data';
import { FIGHTERS } from '../../data/fighters.data';

export interface RankingEntry {
  fighter: Fighter;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  totalFights: number;
  streak: number;
  winRate: number;
  pointsChange: number;
}

interface FighterStats {
  fighter: Fighter;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  totalFights: number;
  streak: number;
  lastResult: 'win' | 'loss' | 'none';
  pointsChange: number;
}

@Injectable({
  providedIn: 'root'
})
export class FightService {

  private fights: Fight[] = FIGHTS;
  private fighters: Fighter[] = FIGHTERS;

  getFights(): Fight[] {
    return this.fights;
  }

  getFight(id: string): Fight | undefined {
    return this.fights.find((fight) => fight.id === id);
  }

  getFighters(): Fighter[] {
    return this.fighters;
  }

  getFighter(id: string | null): Fighter | undefined {
    return id ? this.fighters.find((fighter) => fighter.id === id) : undefined;
  }

  getTotalFightsByFighter(fighterId: string): number {
    return this.fights.filter(
      (fight) => fight.fighter1Id === fighterId || fight.fighter2Id === fighterId
    ).length;
  }

  getWinsByFighter(fighterId: string): number {
    return this.fights.filter((fight) => fight.winnerId === fighterId).length;
  }

  getLossesByFighter(fighterId: string): number {
    return this.fights.filter(
      (fight) =>
        (fight.fighter1Id === fighterId || fight.fighter2Id === fighterId) &&
        fight.winnerId !== null &&
        fight.winnerId !== fighterId
    ).length;
  }

  getWinRateByFighter(fighterId: string): number {
    const wins = this.getWinsByFighter(fighterId);
    const losses = this.getLossesByFighter(fighterId);
    const total = wins + losses;
    return total === 0 ? 0 : Math.round((wins / total) * 100);
  }

  getRanking(): RankingEntry[] {
    const stats = new Map<string, FighterStats>();

    this.fighters.forEach((fighter) => {
      stats.set(fighter.id, {
        fighter,
        score: 1000,
        wins: 0,
        losses: 0,
        draws: 0,
        totalFights: 0,
        streak: 0,
        lastResult: 'none',
        pointsChange: 0,
      });
    });

    for (const fight of this.fights) {
      const fighter1 = stats.get(fight.fighter1Id);
      const fighter2 = stats.get(fight.fighter2Id);

      if (!fighter1 || !fighter2) {
        continue;
      }

      fighter1.totalFights += 1;
      fighter2.totalFights += 1;

      if (this.isDraw(fight)) {
        fighter1.draws += 1;
        fighter2.draws += 1;
        fighter1.score += 5;
        fighter2.score += 5;
        fighter1.pointsChange += 5;
        fighter2.pointsChange += 5;
        fighter1.streak = 0;
        fighter2.streak = 0;
        fighter1.lastResult = 'none';
        fighter2.lastResult = 'none';
        continue;
      }

      if (!fight.winnerId) {
        continue;
      }

      const currentNumberOneId = this.getCurrentNumberOneId(stats);
      const winner = stats.get(fight.winnerId);
      const loser = fight.winnerId === fighter1.fighter.id ? fighter2 : fighter1;
      if (!winner) {
        continue;
      }

      const victoryPoints = this.getVictoryPoints(fight.method, fight.round);
      const defeatPoints = this.getDefeatPoints(fight.method);

      winner.score += victoryPoints;
      loser.score += defeatPoints;
      winner.pointsChange += victoryPoints;
      loser.pointsChange += defeatPoints;

      winner.wins += 1;
      loser.losses += 1;

      if (loser.fighter.champion) {
        winner.score += 25;
        winner.pointsChange += 25;
      }

      if (currentNumberOneId && loser.fighter.id === currentNumberOneId) {
        winner.score += 15;
        winner.pointsChange += 15;
      }

      if (this.isTitleFight(fight)) {
        if (winner.fighter.champion) {
          winner.score += 15;
          winner.pointsChange += 15;
        } else {
          winner.score += 20;
          winner.pointsChange += 20;
        }
      }

      if (winner.lastResult === 'win') {
        winner.streak += 1;
      } else {
        winner.streak = 1;
      }
      winner.lastResult = 'win';

      if (loser.lastResult === 'loss') {
        loser.streak -= 1;
      } else {
        loser.streak = -1;
      }
      loser.lastResult = 'loss';

      if (winner.streak === 3) {
        winner.score += 10;
        winner.pointsChange += 10;
      }
      if (winner.streak === 5) {
        winner.score += 20;
        winner.pointsChange += 20;
      }
    }

    return Array.from(stats.values())
      .map((fighterStat) => ({
        fighter: fighterStat.fighter,
        score: fighterStat.score,
        wins: fighterStat.wins,
        losses: fighterStat.losses,
        draws: fighterStat.draws,
        totalFights: fighterStat.totalFights,
        streak: fighterStat.streak,
        winRate: this.calculateWinRate(fighterStat),
        pointsChange: fighterStat.pointsChange,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }
        if (a.losses !== b.losses) {
          return a.losses - b.losses;
        }
        return b.pointsChange - a.pointsChange;
      });
  }

  private normalizeMethod(method: string | null): string {
    return method?.trim().toLowerCase() ?? '';
  }

  private isDraw(fight: Fight): boolean {
    const normalized = this.normalizeMethod(fight.method);
    return normalized.includes('empate');
  }

  private isDQ(fight: Fight): boolean {
    const normalized = this.normalizeMethod(fight.method);
    return normalized.includes('descalificación') || normalized.includes('descalificacion');
  }

  private isNoShow(fight: Fight): boolean {
    const normalized = this.normalizeMethod(fight.method);
    return normalized.includes('no presentarse') || normalized.includes('no show') || normalized.includes('no-show');
  }

  private isTitleFight(fight: Fight): boolean {
    return (fight as any).titleFight === true;
  }

  private getVictoryPoints(method: string | null, round: number | null): number {
    const normalized = this.normalizeMethod(method);

    if (normalized.includes('ko') || normalized.includes('tko')) {
      switch (round) {
        case 1:
          return 40;
        case 2:
          return 37;
        case 3:
          return 34;
        case 4:
          return 31;
        default:
          return 30;
      }
    }

    if (normalized.includes('sumisión') || normalized.includes('submission')) {
      return 30;
    }

    if (
      normalized.includes('decisión unánime') ||
      normalized.includes('decision unanime') ||
      normalized.includes('decision unánime')
    ) {
      return 25;
    }

    if (normalized.includes('decisión mayoritaria') || normalized.includes('decision mayoritaria')) {
      return 20;
    }

    if (normalized.includes('decisión dividida') || normalized.includes('decision dividida')) {
      return 15;
    }

    return 0;
  }

  private getDefeatPoints(method: string | null): number {
    const normalized = this.normalizeMethod(method);

    if (normalized.includes('no presentarse') || normalized.includes('no show') || normalized.includes('no-show')) {
      return -35;
    }

    if (normalized.includes('descalificación') || normalized.includes('descalificacion')) {
      return -30;
    }

    if (normalized.includes('ko') || normalized.includes('tko')) {
      return -25;
    }

    if (normalized.includes('sumisión') || normalized.includes('submission')) {
      return -22;
    }

    if (
      normalized.includes('decisión unánime') ||
      normalized.includes('decision unanime') ||
      normalized.includes('decision unánime')
    ) {
      return -18;
    }

    if (normalized.includes('decisión mayoritaria') || normalized.includes('decision mayoritaria')) {
      return -15;
    }

    if (normalized.includes('decisión dividida') || normalized.includes('decision dividida')) {
      return -10;
    }

    return 0;
  }

  private getCurrentNumberOneId(stats: Map<string, FighterStats>): string | null {
    const sorted = Array.from(stats.values()).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return a.losses - b.losses;
    });

    if (sorted.length === 0) {
      return null;
    }

    const topScore = sorted[0].score;
    const top = sorted.filter((item) => item.score === topScore);
    return top.length === 1 ? top[0].fighter.id : null;
  }

  private calculateWinRate(fighterStat: FighterStats): number {
    const completed = fighterStat.wins + fighterStat.losses;
    return completed === 0 ? 0 : Math.round((fighterStat.wins / completed) * 100);
  }
}
