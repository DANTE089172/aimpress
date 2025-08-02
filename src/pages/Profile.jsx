import React, { useState, useEffect } from 'react';
import { User as UserModel } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, User as UserIcon } from 'lucide-react';
import AudienceSelector from '../components/modes/AudienceSelector';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [audienceMode, setAudienceMode] = useState('professional');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await UserModel.me();
      setUser(currentUser);
      setFullName(currentUser.full_name || '');
      
      const savedMode = localStorage.getItem(`stickyboard-user-type-${currentUser.email}`);
      setAudienceMode(savedMode || 'professional');
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode) => {
    setAudienceMode(mode);
    if (user) {
      localStorage.setItem(`stickyboard-user-type-${user.email}`, mode);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      await UserModel.updateMyUserData({ full_name: fullName });
      setSaveMessage('Profile updated successfully!');
      setUser(prev => ({ ...prev, full_name: fullName }));
    } catch (error) {
      setSaveMessage('Failed to update profile. Please try again.');
      console.error("Failed to update user data", error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Unable to load user profile</p>
          <Button asChild variant="outline">
            <Link to={createPageUrl('Boards')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Boards
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Profile & Settings</h1>
              <p className="text-slate-600">Manage your account and preferences</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to={createPageUrl('Boards')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Boards
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled className="bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                {saveMessage && (
                  <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage}
                  </p>
                )}
                <Button type="submit" disabled={isSaving} className="ml-auto">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Application Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Application Mode</CardTitle>
              <CardDescription>Choose the experience that best fits your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <AudienceSelector 
                currentMode={audienceMode} 
                onModeChange={handleModeChange} 
                simplified 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}