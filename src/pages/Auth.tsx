import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Moon, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Moon className="w-8 h-8 text-primary animate-pulse" /></div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email, password, displayName)
      : await signIn(email, password);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (isSignUp) {
      toast({ title: 'Check your email', description: 'We sent you a confirmation link.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center islamic-pattern bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="w-full max-w-md shadow-gold border-primary/20">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Moon className="w-8 h-8 text-primary" />
              <Star className="w-5 h-5 text-primary/60" />
            </div>
            <h1 className="text-3xl font-serif text-foreground">Ramadan Planner</h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Create your account to begin your journey' : 'Welcome back, continue your journey'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full gradient-gold text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                {submitting ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
