import { useState } from 'react';
import './App.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="bg-yellow-300 w-auto p-2">
      <header className="w-full flex items-center bg-red-400 justify-between">
        <div className="">
          <h2>LifeNode</h2>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <p>Buy me coffee</p>
          </div>
          <Settings />
        </div>
      </header>
      <main>
        <Tabs defaultValue="account" className="">
          <TabsList className="gap-10">
            <TabsTrigger value="account" className="w-32">
              Account
            </TabsTrigger>
            <TabsTrigger value="password" className="w-32">
              Password
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
