"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Firm profile, billing, and notifications
        </p>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Firm profile</h3>
            <p className="text-sm text-muted-foreground">
              Firm name, address, and contact information
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firm-name">Firm name</Label>
              <Input id="firm-name" placeholder="Smith & Martinez, LLP" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firm-address">Address</Label>
              <Input id="firm-address" placeholder="123 Main St, City, State" />
            </div>
            <Button onClick={() => toast.success("Settings saved")}>
              Save changes
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Court date reminders and deadline alerts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Hearing reminders</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Invoice due reminders</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Document upload notifications</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
