type Vehicle = { make: string; model: string; year: number };

export const ARGUS_API_KEY = process.env.NEXT_PUBLIC_ARGUS_API_KEY;

export async function getVoitureByPlate(plate: string): Promise<Vehicle> {

    const resp = await fetch(
    `https://example.com/immat-api?plate=${encodeURIComponent(plate)}&key=${ARGUS_API_KEY}`
  );
  const data = await resp.json();

  return {
    make: data.make,
    model: data.model,
    year: data.year,
  };
}

export async function getArgusValue(input: Vehicle & { mileage: number }): Promise<number> {

    const resp = await fetch(
    `https://example.com/argus?make=${input.make}&model=${input.model}&year=${input.year}&mileage=${input.mileage}&key=${ARGUS_API_KEY}`
  );
  const data = await resp.json();
  return data.value;
}
