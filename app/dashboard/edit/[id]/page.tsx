"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BuscarMarca from "components/BuscarMarca";
import { combustible as opcionesCombustible } from "constants/index";
import { transmision as opcionesTransmision } from "constants/index";
import { ubicaciones as opcionesUbicaciones } from "constants/index";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableImage from "components/SortableImage";
import Image from "next/image";

const EditPost = () => {
    const { id } = useParams(); // Obtiene el ID del auto desde la URL
    const router = useRouter();

    const [marca, setMarca] = useState<string>("");
    const [modelo, setModelo] = useState<string>("");
    const [anio, setAnio] = useState<number | string>("");
    const [kilometraje, setKilometraje] = useState<number | string>("");
    const [precio, setPrecio] = useState<number | string>("");
    const [motor, setMotor] = useState<string>("");
    const [transmision, setTransmision] = useState<string>("");
    const [combustibleSeleccionado, setCombustibleSeleccionado] = useState<string>("");
    const [caballosDeFuerza, setCaballosDeFuerza] = useState<number | string>("");
    const [descripcion, setDescripcion] = useState<string>("");
    const [ubicacion, setUbicacion] = useState<string>("");
    const [imagenes, setImagenes] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]); // URLs de imágenes existentes
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAutoData = async () => {
            if (!id) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getCar/${id}`);
                if (!response.ok) throw new Error("Error al cargar los datos del auto");
                const data = await response.json();

                            // Precargar datos
            setMarca(data.marca);
            setModelo(data.modelo);
            setAnio(data.anio);
            setKilometraje(data.kilometraje);
            setPrecio(data.precio);
            setMotor(data.motor);
            setTransmision(data.transmision);
            setCombustibleSeleccionado(data.combustible);
            setCaballosDeFuerza(data.caballosDeFuerza);
            setDescripcion(data.descripcion);
            setUbicacion(data.ubicacion);

            // Asegurarse de que las imágenes sean rutas completas
            const fullImageUrls = data.imagenes?.map((image: string) => `${process.env.NEXT_PUBLIC_API_URL}${image}`) || [];
            setExistingImages(fullImageUrls); // Imágenes existentes con URL completa
        } catch (err: any) {
            setError(err.message);
        }
    };

    fetchAutoData();
}, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImagenes([...imagenes, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        } else {
            setImagenes((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = existingImages.findIndex((_, i) => i === active.id);
            const newIndex = existingImages.findIndex((_, i) => i === over.id);
            setExistingImages((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();

        formData.append("marca", marca);
        formData.append("modelo", modelo);
        formData.append("anio", String(anio));
        formData.append("kilometraje", String(kilometraje));
        formData.append("precio", String(precio));
        formData.append("motor", motor);
        formData.append("transmision", transmision);
        formData.append("combustible", combustibleSeleccionado);
        formData.append("caballosDeFuerza", String(caballosDeFuerza));
        formData.append("descripcion", descripcion);
        formData.append("ubicacion", ubicacion);

        imagenes.forEach((imagen) => {
            formData.append("imagenes", imagen);
        });

        formData.append("existingImages", JSON.stringify(existingImages));

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/edit/${id}`, {
                method: "PUT",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) throw new Error("Error al actualizar la publicación");

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 pt-32">
            <h2 className="font-bold text-3xl mb-10">Editar Publicación</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-3xl">
                {error && <p className="text-red-500">{error}</p>}
    
                <div className="mb-4">
                    <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
                        Marca
                    </label>
                    <BuscarMarca
                        marca={marca} // Pre-cargar el valor de la marca del auto
                        definirMarca={setMarca}
                        customClass="border-2 border-gray-300 bg-white rounded-lg"
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">
                        Modelo
                    </label>
                    <input
                        type="text"
                        id="modelo"
                        value={modelo} // Pre-cargar el valor del modelo
                        placeholder="Vento GLI"
                        onChange={(e) => setModelo(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="anio" className="block text-sm font-medium text-gray-700">
                        Año
                    </label>
                    <input
                        type="number"
                        id="anio"
                        value={anio} // Pre-cargar el valor del año
                        placeholder="2023"
                        onChange={(e) => setAnio(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="kilometraje" className="block text-sm font-medium text-gray-700">
                        Kilometraje (km)
                    </label>
                    <input
                        type="number"
                        id="kilometraje"
                        value={kilometraje} // Pre-cargar el valor del kilometraje
                        placeholder="10000"
                        onChange={(e) => setKilometraje(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                        Precio (US$)
                    </label>
                    <input
                        type="number"
                        id="precio"
                        value={precio} // Pre-cargar el valor del precio
                        placeholder="50000"
                        onChange={(e) => setPrecio(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="motor" className="block text-sm font-medium text-gray-700">
                        Motor
                    </label>
                    <input
                        type="text"
                        id="motor"
                        value={motor} // Pre-cargar el valor del motor
                        placeholder="2.0"
                        onChange={(e) => setMotor(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="transmision" className="block text-sm font-medium text-gray-700">
                        Transmisión
                    </label>
                    <select
                        id="transmision"
                        value={transmision} // Pre-cargar el valor de la transmisión
                        onChange={(e) => setTransmision(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    >
                        <option value="" disabled>
                            Seleccione un tipo de transmisión
                        </option>
                        {opcionesTransmision.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.title}
                            </option>
                        ))}
                    </select>
                </div>
    
                <div className="mb-4">
                    <label htmlFor="combustible" className="block text-sm font-medium text-gray-700">
                        Combustible
                    </label>
                    <select
                        id="combustible"
                        value={combustibleSeleccionado} // Pre-cargar el valor del combustible
                        onChange={(e) => setCombustibleSeleccionado(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    >
                        <option value="" disabled>
                            Seleccione un tipo de combustible
                        </option>
                        {opcionesCombustible.map((item: { value: string; title: string }) => (
                            <option key={item.value} value={item.value}>
                                {item.title}
                            </option>
                        ))}
                    </select>
                </div>
    
                <div className="mb-4">
                    <label htmlFor="caballosDeFuerza" className="block text-sm font-medium text-gray-700">
                        Caballos de Fuerza
                    </label>
                    <input
                        type="number"
                        id="caballosDeFuerza"
                        value={caballosDeFuerza} // Pre-cargar el valor de caballos de fuerza
                        placeholder="250"
                        onChange={(e) => setCaballosDeFuerza(Number(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        value={descripcion} // Pre-cargar el valor de la descripción
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-300"
                        rows={4}
                        required
                    />
                </div>
    
                <div className="mb-4">
                    <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">
                        Ubicación
                    </label>
                    <select
                        id="ubicacion"
                        value={ubicacion} // Pre-cargar el valor de la ubicación
                        onChange={(e) => setUbicacion(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        required
                    >
                        <option value="" disabled>
                            Seleccione una sucursal
                        </option>
                        {Object.entries(opcionesUbicaciones).map(([key, value]) => (
                            <option key={key} value={key}>
                                {key} - {value}
                            </option>
                        ))}
                    </select>
                </div>
    
                <div className="mb-4">
    <label htmlFor="imagenes" className="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar imágenes (máx. 15)
    </label>
    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-blue-500 focus-within:ring-2 focus-within:ring-primary-blue-500 cursor-pointer">
        <label
            htmlFor="imagenes"
            className="flex flex-col items-center justify-center gap-2 text-gray-600 cursor-pointer"
        >
            <div className="text-4xl text-primary-blue-500 font-bold">+</div>
            <p className="text-sm">Haz clic aquí o arrastra para subir archivos</p>
        </label>
        <input
            type="file"
            id="imagenes"
            name="imagenes"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
    </div>
</div>

{/* Imágenes existentes */}
{existingImages.length > 0 && (
    <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">Imágenes existentes</h3>
        <div className="flex gap-2 mt-2">
            {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                    <Image
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md"
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveImage(index, true)}
                        className="absolute top-0 right-0 text-red-500"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    </div>
)}

{/* Imágenes seleccionadas */}
{imagenes.length > 0 && (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={imagenes.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-wrap gap-2 overflow-x-hidden mt-4 mb-4">
                {imagenes.map((imagen, index) => (
                    <div key={index} className="w-1/2 sm:w-1/4 lg:w-1/6 relative">
                        <SortableImage
                            id={index}
                            image={URL.createObjectURL(imagen)}
                            onRemove={() => handleRemoveImage(index, false)}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index, false)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                            <Image
                                src={"/trash.svg"}
                                alt="close"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        </button>
                    </div>
                ))}
            </div>
        </SortableContext>
    </DndContext>
)}
            </form>
        </div>
    );
}

export default EditPost
