import { BusinessEmployee } from "./BusinessEmployee";

export interface EmploymentTeam {
    id: string;
    employment: BusinessEmployee;
    assignedAt: string;
}

export class Team {
    id: string;
    name: string;
    colorCode: string | null;
    businessId: string;
    members: EmploymentTeam[];
    createdAt: string;
    updatedAt: string;

    constructor(
        id: string,
        name: string,
        colorCode: string | null,
        businessId: string,
        members: EmploymentTeam[],
        createdAt: string,
        updatedAt: string
    ) {
        this.id = id;
        this.name = name;
        this.colorCode = colorCode;
        this.businessId = businessId;
        this.members = members;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static parseApiResponse(data: any): Team | null {
        if (!data) return null;
        try {
            const members = data.members ? data.members.map((m: any) => ({
                id: m.id,
                employment: BusinessEmployee.parseApiResponse(m.employment),
                assignedAt: m.assignedAt,
            })).filter((m: any) => m.employment !== null) : [];

            return new Team(
                data.id,
                data.name,
                data.colorCode || null,
                data.businessId,
                members,
                data.createdAt,
                data.updatedAt
            );
        } catch (error) {
            console.error("Error parsing Team:", error);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): Team[] {
        const arr: Team[] = [];
        if (!Array.isArray(data)) return arr;
        data.forEach((val) => {
            const team = this.parseApiResponse(val);
            if (team) arr.push(team);
        });
        return arr;
    }
}
