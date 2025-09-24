import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function StaffMenuPage() {
    const menuItems = [
        { id: 1, name: "Cappuccino", category: "Coffee", price: 3.5, available: true },
        { id: 2, name: "Latte", category: "Coffee", price: 3.0, available: true },
        { id: 3, name: "Espresso", category: "Coffee", price: 2.5, available: false },
        { id: 4, name: "Croissant", category: "Pastry", price: 2.0, available: true },
        { id: 5, name: "Muffin", category: "Pastry", price: 2.5, available: true },
    ]

    return (
        <div className="space-y-6 p-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
                <p className="text-muted-foreground">View the menu and check item availability.</p>
            </div>

            {/* Menu Items */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            <Badge variant={item.available ? "default" : "destructive"}>
                                {item.available ? "Available" : "Unavailable"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-2">
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                            {item.available && (
                                <Button size="sm" variant="outline">
                                    Mark as Unavailable
                                </Button>
                            )}
                            {!item.available && (
                                <Button size="sm" variant="default">
                                    Mark as Available
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
