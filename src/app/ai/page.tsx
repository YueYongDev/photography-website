import { AIContentGenerator } from "@/modules/ai/components/ai-content-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIPage() {
  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            AI内容生成测试
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AIContentGenerator />
        </CardContent>
      </Card>
    </div>
  );
}