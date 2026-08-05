import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Trophy, Flame, Target, Award, TrendingUp, Medal, Crown, Star } from 'lucide-react';
import { motion } from 'motion/react';

const badges = [
  { id: 1, name: 'Budget Master', icon: Target, earned: true, color: 'gold', level: 'Gold' },
  { id: 2, name: 'Savings Guru', icon: Trophy, earned: true, color: 'gold', level: 'Gold' },
  { id: 3, name: 'Expense Tracker', icon: Award, earned: true, color: 'silver', level: 'Silver' },
  { id: 4, name: '30-Day Streak', icon: Flame, earned: true, color: 'bronze', level: 'Bronze' },
  { id: 5, name: 'Investment Pro', icon: TrendingUp, earned: false, color: 'gray', level: 'Locked' },
  { id: 6, name: 'Debt Free', icon: Medal, earned: false, color: 'gray', level: 'Locked' }
];

const leaderboard = [
  { rank: 1, name: 'Sarah Johnson', score: 2850, avatar: 'SJ', streak: 45, icon: Crown },
  { rank: 2, name: 'Mike Chen', score: 2720, avatar: 'MC', streak: 38, icon: Medal },
  { rank: 3, name: 'You', score: 2580, avatar: 'ME', streak: 32, icon: Star },
  { rank: 4, name: 'Emma Davis', score: 2450, avatar: 'ED', streak: 28, icon: null },
  { rank: 5, name: 'Alex Kim', score: 2380, avatar: 'AK', streak: 25, icon: null },
  { rank: 6, name: 'Chris Lee', score: 2210, avatar: 'CL', streak: 22, icon: null }
];

const challenges = [
  { 
    id: 1, 
    name: 'No Coffee Week', 
    description: 'Skip coffee shops for 7 days', 
    progress: 5, 
    total: 7, 
    reward: 50,
    active: true
  },
  { 
    id: 2, 
    name: 'Save ₹500', 
    description: 'Save ₹500 this month', 
    progress: 320, 
    total: 500, 
    reward: 100,
    active: true
  },
  { 
    id: 3, 
    name: 'Budget Adherence', 
    description: 'Stay within budget for 30 days', 
    progress: 18, 
    total: 30, 
    reward: 150,
    active: true
  }
];

export function Gamification() {
  const currentStreak = 32;
  const longestStreak = 45;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Gamified Savings & Challenges</h2>
        <p className="text-muted-foreground">Earn rewards and compete with others</p>
      </div>

      {/* Streak Tracker */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center"
            >
              <Flame className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h3 className="text-orange-900 dark:text-orange-100">Daily Streak</h3>
              <p className="text-orange-700 dark:text-orange-300">Keep logging expenses daily!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-900 dark:text-orange-100">Current Streak</p>
            <p className="text-orange-700 dark:text-orange-300">{currentStreak} days 🔥</p>
            <p className="text-orange-600 dark:text-orange-400 mt-1">
              Longest: {longestStreak} days
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Progress value={(currentStreak / longestStreak) * 100} className="h-3" />
        </div>
      </Card>

      {/* Active Challenges */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Active Challenges</h3>
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const percentage = (challenge.progress / challenge.total) * 100;
            return (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950 rounded-2xl border border-teal-200 dark:border-teal-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4>{challenge.name}</h4>
                    <p className="text-muted-foreground">{challenge.description}</p>
                  </div>
                  <Badge className="bg-gold text-white">
                    +{challenge.reward} pts
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{challenge.progress} / {challenge.total}</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Badge Gallery */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Badge Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            const colorMap = {
              gold: 'from-yellow-400 to-yellow-600',
              silver: 'from-gray-300 to-gray-500',
              bronze: 'from-orange-400 to-orange-600',
              gray: 'from-gray-200 to-gray-400'
            };
            
            return (
              <motion.div
                key={badge.id}
                whileHover={badge.earned ? { scale: 1.1, rotate: 5 } : {}}
                className={`p-4 rounded-2xl text-center ${
                  badge.earned 
                    ? 'bg-gradient-to-br ' + colorMap[badge.color as keyof typeof colorMap]
                    : 'bg-gray-100 dark:bg-slate-900 opacity-50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  badge.earned ? 'bg-white/30' : 'bg-gray-300 dark:bg-slate-800'
                }`}>
                  <Icon className={`w-8 h-8 ${badge.earned ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <p className={`${badge.earned ? 'text-white' : 'text-muted-foreground'}`}>
                  {badge.name}
                </p>
                <p className={badge.earned ? 'text-white/80' : 'text-muted-foreground'}>
                  {badge.level}
                </p>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const Icon = user.icon;
            const isCurrentUser = user.name === 'You';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 border-2 border-teal-500' 
                    : 'bg-gray-50 dark:bg-slate-900 hover:shadow-md'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  user.rank === 2 ? 'bg-gray-400 text-gray-900' :
                  user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-300 dark:bg-slate-700'
                }`}>
                  {Icon ? <Icon className="w-4 h-4" /> : <span>{user.rank}</span>}
                </div>
                
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={isCurrentUser ? 'bg-teal-600 text-white' : ''}>
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className={isCurrentUser ? 'text-teal-900 dark:text-teal-100' : ''}>
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{user.streak} day streak</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p>{user.score}</p>
                  <p className="text-muted-foreground">points</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}