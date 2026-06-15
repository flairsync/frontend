export class MyEmployment {
    id: string;
    type: string;
    status: string;
    business: {
        id: string;
        name: string;
        description?: string;
        logo?: string;
    };
    hourlyRate: number;
    currency: string;

    constructor(
        id: string,
        type: string,
        status: string,
        business: { id: string; name: string; description?: string; logo?: string },
        hourlyRate: number,
        currency: string,
    ) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.business = business;
        this.hourlyRate = hourlyRate;
        this.currency = currency;
    }

    static parseApiResponse(data: any): MyEmployment | null {
        if (!data) return null;
        try {
            return new MyEmployment(
                data.id,
                data.type,
                data.status,
                data.business,
                data.hourlyRate || 0,
                data.currency || 'EUR',
            );
        } catch (error) {
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): MyEmployment[] {
        const arr: MyEmployment[] = [];
        data.forEach((val) => {
            const employment = this.parseApiResponse(val);
            if (employment) arr.push(employment);
        });
        return arr;
    }
}
