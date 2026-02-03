
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";

interface HistoryEntry {
  imageName: string;
  imageData?: string;
  isColoboma: boolean;
  confidence: string;
  createdAt: string;
}

const MedicalHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

 useEffect(() => {
  const fetchHistory = async () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userString);
    setUser(userData);

    try {
      const response = await fetch(
        `${API_BASE_URL}/history/${userData.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setHistory(data.history || []);
      console.log(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch medical history",
        variant: "destructive",
      });
    }
  };

  fetchHistory();
}, [navigate]);


  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Medical History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: {user.name}
            </p>
          </div>
          <Button onClick={() => navigate("/upload")}>New Diagnosis</Button>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    {/* Image Section */}
                    <div className="flex-shrink-0 w-full md:w-64">
                      {entry.imageData ? (
                        <img 
                          src={`data:image/jpeg;base64,${entry.imageData}`}
                          alt={entry.imageName}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-500">{entry.imageName}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Details Section */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-lg font-medium">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Diagnosis Result</p>
                          <span
                            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                              entry.isColoboma
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {entry.isColoboma
                              ? "Coloboma Detected"
                              : "No Coloboma Detected"}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Confidence Level</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-2xl font-bold">{entry.confidence}%</p>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                              <div 
                                className={`h-2 rounded-full ${
                                  entry.isColoboma ? 'bg-red-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${entry.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No medical history found. Upload an image for diagnosis.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/upload")}
              >
                Start Diagnosis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalHistory;
