import { Card, CardContent } from "./ui/Card";

export default function KPICard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  {
    return (
      <Card>
        <CardContent className="py-5">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {value}
          </div>
        </CardContent>
      </Card>
    );
  }
}
