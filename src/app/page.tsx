import { ComposeEmailForm } from "@/components/ComposeEmailForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function ComposePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>
            Draft and send your professional emails from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComposeEmailForm />
        </CardContent>
      </Card>
    </div>
  );
}
