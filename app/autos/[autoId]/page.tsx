import dbConnect from 'app/utils/db';
import CarModel from 'app/models/Car';
import { Metadata } from 'next';
import AutoDetallesClient from './AutoDetallesClient';


interface AutoDetallesProps {
  params: {
    autoId: string;
  };
}

export async function generateMetadata({ params }: AutoDetallesProps): Promise<Metadata> {
  const { autoId } = await params;

  await dbConnect();

  // Buscar el auto directamente por el slug (no por ObjectId)
  const car = await CarModel.findOne({ slug: autoId });

  if (!car) {
    return {
      title: 'Auto no encontrado',
      description: 'No se encontró información sobre el auto.',
    };
  }

  return {
    title: `Detalles del auto: ${car.marca} ${car.modelo} ${car.anio}`,
    description: `Conoce más sobre el auto ${car.marca} ${car.modelo} ${car.anio}.`,
  };
}

const Page = async ({ params }: AutoDetallesProps) => {
  const { autoId } = await params;

  await dbConnect();

  // Buscar el auto directamente por el slug
  const car = await CarModel.findOne({ slug: autoId });

  if (!car) {
    return <div className="p-6">Auto no encontrado</div>;
  }

  // Crear los datos del auto con el _id como string
  const carData = {
    ...car.toObject(),
    _id: car._id.toString(),
  };

  // Pasamos los datos del auto al componente cliente
  return <AutoDetallesClient car={carData} slug={autoId} />;
};

export default Page;
