
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function TotesInformacionPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información sobre Contenedores "Tote" en Ditzler Chile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Propósito logístico de los totes</h2>
            <p className="mb-2">
              Ditzler Chile es un procesador de frutas suizo-chileno que elabora productos como mermeladas y pulpas
              (<a href="https://chilealimentos.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">chilealimentos.com</a>).
              Para manejar estos volúmenes de producto en planta, la empresa emplea "totes", es decir, cajas o contenedores plásticos grandes y resistentes.
              Estos contenedores versátiles están diseñados para manejar grandes volúmenes con durabilidad y facilidad de manipulación
              (<a href="https://grupoacura.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">grupoacura.com</a>).
            </p>
            <p>
              En la práctica, los totes facilitan la logística interna de Ditzler: permiten transportar lotes de pulpa o mermelada entre etapas (cocción, enfriado, almacenamiento) sin derrames ni contaminación, agilizando el flujo de producción y protegiendo la inocuidad del producto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Uso de los contenedores en la operación de Ditzler</h2>
            <p className="mb-2">
              Tras la cocción de la fruta, los operarios de Ditzler descargan el producto directamente en los grandes contenedores plásticos (totes).
              Estos contenedores móviles suelen montarse en carros con ruedas o paletas y se desplazan con montacargas hacia la zona de enfriamiento o hacia la línea de envasado.
            </p>
            <div className="my-4 flex justify-center">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Totes en operación en planta" 
                className="rounded-md shadow-md max-w-full h-auto md:max-w-lg"
                width={600}
                height={400}
                data-ai-hint="food processing" 
              />
            </div>
            <p className="mb-2">
              De este modo, el producto semiacabado se almacena y transporta de forma ordenada entre procesos.
            </p>
            <p>
              Además, al ser reutilizables, estos recipientes están diseñados para permitir una limpieza completa
              (<a href="https://www.wipo.int" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">wipo.int</a>),
              requisito fundamental para mantener la higiene entre lotes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Tipos y características de los contenedores (totes) utilizados</h2>
            <p className="mb-2">
              Los "totes" de Ditzler son contenedores alimentarios de plástico de grado alimenticio (por ejemplo, polietileno de alta densidad o policarbonato) – algunos modelos llevan ruedas o asas y tapas herméticas.
              También existen versiones de acero inoxidable para usos más exigentes
              (<a href="https://grupoacura.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">grupoacura.com</a>).
            </p>
            <div className="my-4 flex justify-center">
              <Image 
                src="https://placehold.co/400x300.png" 
                alt="Tipos de totes plásticos" 
                className="rounded-md shadow-md max-w-full h-auto md:max-w-sm"
                width={400}
                height={300}
                data-ai-hint="plastic totes"
              />
            </div>
            <p className="mb-2">
              Estas cajas deben ser de material resistente a la corrosión y a los ácidos de frutas, con superficies lisas que no liberen contaminantes.
              Su capacidad varía según el uso: hay modelos apilables de decenas de litros hasta grandes IBC (contenedores intermedios a granel) de hasta ~1000 litros
              (<a href="https://grupoacura.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">grupoacura.com</a>).
              Por ejemplo, fabricantes como Rubbermaid ofrecen cajas apilables de policarbonato certificadas NSF, con capacidades que van de 11 a 80 litros
              (<a href="https://www.rubbermaid.eu" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">rubbermaid.eu</a>).
            </p>
            <p>
              En resumen, los totes combinan ligereza, robustez y facilidad de manipulación, adaptándose al volumen de pulpa o mermelada que Ditzler maneja en cada turno.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Áreas y roles que utilizan los totes</h2>
            <p className="mb-2">El uso de estos contenedores involucra varias áreas operativas de la empresa:</p>
            <ul className="list-disc list-inside space-y-1 mb-2 pl-4">
              <li><strong>Producción:</strong> los operarios de planta llenan y vacían los totes con el producto cocido, moviéndolos manualmente o con carretillas hacia las siguientes etapas del proceso.</li>
              <li><strong>Logística y almacén:</strong> el personal de bodega o montacargas traslada los totes llenos (a veces apilados en pallets) a cámaras de frío o al área de expedición.</li>
              <li><strong>Control de calidad / Higiene:</strong> el equipo responsable de calidad e inocuidad se encarga de definir y supervisar los procedimientos de limpieza de los totes, incluyendo estaciones CIP (Cleaning in Place) para sanitizarlos entre lotes.</li>
              <li><strong>Despacho:</strong> eventualmente, el área de logística prepara los containers "tote" cuando son utilizados para cargar producto terminado hacia clientes u otros destinos.</li>
            </ul>
             <div className="my-4 flex justify-center">
              <Image 
                src="https://placehold.co/500x350.png" 
                alt="Operarios trabajando con totes o estación CIP" 
                className="rounded-md shadow-md max-w-full h-auto md:max-w-md"
                width={500}
                height={350}
                data-ai-hint="warehouse logistics"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Normativa y buenas prácticas en la industria alimentaria chilena</h2>
            <p className="mb-2">
              El Reglamento Sanitario de los Alimentos (D.S. 977/1996 modificado) establece normas estrictas para los contenedores en contacto con alimentos.
              Específicamente, exige que los utensilios y recipientes alimentarios estén construidos con materiales adecuados, resistentes al producto y que no cedan sustancias tóxicas ni modifiquen las propiedades del alimento
              (<a href="https://www.wipo.int" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">wipo.int</a>).
            </p>
            <div className="my-4 flex justify-center">
              <Image 
                src="https://placehold.co/500x300.png" 
                alt="Símbolo de seguridad alimentaria o limpieza" 
                className="rounded-md shadow-md max-w-full h-auto md:max-w-md"
                width={500}
                height={300}
                data-ai-hint="food safety"
              />
            </div>
            <p className="mb-2">
              Además, los envases reutilizables (como los totes de Ditzler) deben permitir una limpieza completa;
              tras cada uso deben lavarse, desinfectarse y mantenerse en condiciones sanitarias antes de volver a usarlos.
              El Decreto también permite el uso de envases retornables siempre que se higienicen correctamente entre usos
              (<a href="https://www.wipo.int" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">wipo.int</a>).
            </p>
            <p className="mb-2">
              Estas exigencias se cumplen en la práctica de Ditzler mediante la higienización rutinaria de sus contenedores (por ejemplo, en estaciones CIP), garantizando así la inocuidad de sus preparaciones.
            </p>
            <div className="mt-4 p-3 bg-secondary/50 rounded-md">
              <h3 className="font-semibold mb-1 text-primary/90">Fuentes:</h3>
              <ul className="list-disc list-inside space-y-1 text-xs md:text-sm">
                <li>
                  Regulaciones y guías del sector alimentario (R.S.A. D.S. 977/1996) - Referencia: 
                  <a href="https://www.wipo.int" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">wipo.int</a>
                </li>
                <li>
                  Información de producto y logística de Ditzler Chile - Referencia: 
                  <a href="https://chilealimentos.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">chilealimentos.com</a>
                </li>
                 <li>
                  Especificaciones técnicas de totes (capacidad, materiales) - Referencia: 
                  <a href="https://grupoacura.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">grupoacura.com</a>, 
                  <a href="https://www.rubbermaid.eu" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline ml-1">rubbermaid.eu</a>
                </li>
              </ul>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

    