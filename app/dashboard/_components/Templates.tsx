import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitBranchPlus, MessageSquare, Webhook, Calendar } from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Customer Support Agent",
    description: "Automated customer support with FAQ handling and ticket creation",
    icon: MessageSquare,
    category: "Support"
  },
  {
    id: 2,
    name: "Data Fetcher",
    description: "Fetch and process data from multiple APIs with conditional logic",
    icon: Webhook,
    category: "Integration"
  },
  {
    id: 3,
    name: "Task Scheduler",
    description: "Schedule and manage automated tasks with approval workflows",
    icon: Calendar,
    category: "Automation"
  }
];

export default function Templates() {
  return (
    <div className="w-full mt-5">
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Agent Templates</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Start with pre-built templates to quickly create AI agents
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>
                  <GitBranchPlus className="mr-2 h-4 w-4" />
                  Use Template (Coming Soon)
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates available yet.</p>
        </div>
      )}
    </div>
  );
}
