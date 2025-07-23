"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ModeToggle";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function UIPlaygroundPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground p-8 space-y-12">
        <div className="flex justify-end">
          <ModeToggle />
        </div>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🔍</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badges</h2>
          <div className="flex gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Alerts</h2>
          <div className="space-y-2">
            <Alert>
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>This is a default message.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Destructive Alert</AlertTitle>
              <AlertDescription>Something went wrong!</AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Forms */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Form Controls</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <Input placeholder="Text input" />
            <Textarea placeholder="Multi-line input" />
            <Select defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Group 1</SelectLabel>
                  <SelectItem value="one">One</SelectItem>
                  <SelectItem value="two">Two</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch />
              <label>Toggle switch</label>
            </div>
          </div>
        </section>

        {/* Data & Feedback */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Progress & Skeleton</h2>
          <div className="space-y-2 max-w-sm">
            <Progress value={25} />
            <Progress value={50} />
            <Progress value={75} />
            <Skeleton className="h-6 w-full" />
          </div>
        </section>

        {/* Cards and Avatar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Card & Avatar</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Some content inside the card.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src="https://via.placeholder.com/40" />
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tabs</h2>
          <Tabs defaultValue="tab1" className="space-y-2">
            <TabsList>
              <TabsTrigger value="tab1">Tab One</TabsTrigger>
              <TabsTrigger value="tab2">Tab Two</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content for tab one.</TabsContent>
            <TabsContent value="tab2">Content for tab two.</TabsContent>
          </Tabs>
        </section>

        {/* Tooltip */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Tooltip</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button>Hover me</Button>
              </TooltipTrigger>
              <TooltipContent side="top">This is a tooltip.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </section>
      </div>
    </ThemeProvider>
  );
}
