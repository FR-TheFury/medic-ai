
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { useGetVariantsByMaladie } from "@/hooks/use-maladies";

interface MaladieCardProps {
  id: number;
  name: string;
  variants?: string[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export default function MaladieCard({ id, name, variants = [], onEdit, onDelete, onView }: MaladieCardProps) {
  // Récupérer les variants dynamiquement
  const { data: variantData, isLoading } = useGetVariantsByMaladie(id);
  const displayVariants = variantData?.length > 0 
    ? variantData.map((v: any) => v.nomVariant) 
    : variants;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>ID: {id}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement des variants...</p>
        ) : displayVariants && displayVariants.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Variants:</h4>
            <div className="flex flex-wrap gap-2">
              {displayVariants.map((variant: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {variant}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun variant enregistré</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onView(id)}>
          Voir détails
        </Button>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
