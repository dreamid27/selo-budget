import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Loader2, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import Navbar from './navbar';
import { toast } from 'sonner';

const SettingsPage = () => {
  const settings = useLiveQuery(() =>
    db.settings.toArray().then((settings) => settings[0])
  );

  const [name, setName] = useState(settings?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveSettings = async () => {
    if (!settings?.id) return;

    setIsSaving(true);
    try {
      await db.settings.update(settings.id, { name });
      toast.success('Settings saved', {
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      // Delete all data from tables
      await Promise.all([
        db.transactions.clear(),
        db.accounts.clear(),
        db.categories.clear(),
        db.budgetLimits.clear(),
        db.settings.clear(),
        db.budgets.clear(),
        db.goals.clear(),
      ]);

      // Reinitialize with default data
      await db.settings.add({
        name: 'User',
        currency: 'USD',
        theme: 'light',
      });

      toast.success('Database reset', {
        description: 'All data has been cleared and reset to defaults.',
      });

      // Redirect to onboarding
      window.location.href = '/';
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to reset database. Please try again.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your application settings and preferences.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your profile information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving || name === settings.name}
                className="w-full sm:w-auto"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSaving && <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Actions here can't be undone. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    disabled={isResetting}
                  >
                    {isResetting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {!isResetting && <RefreshCw className="mr-2 h-4 w-4" />}
                    Reset Database
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Reset Database
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        Are you absolutely sure you want to reset the database?
                        This action cannot be undone.
                      </p>
                      <p className="font-medium">
                        This will permanently delete:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>All your transactions</li>
                        <li>Account information</li>
                        <li>Budget settings</li>
                        <li>Categories</li>
                        <li>Goals and progress</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetDatabase}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Reset Database
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
