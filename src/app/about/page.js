import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Woylahh</h1>
      <p className="text-gray-600">
        Ini halaman about
      </p>

      <Button variant="default">Click Me</Button>
      <Button variant="outline">Secondary Action</Button>
    </div>
  );
}