"use client";
import { useState, useEffect } from "react";

interface Pregunta {
  pregunta: string;
  opciones: string[];
  correcta: string;
}

export default function CornellPage() {
  const [claves, setClaves] = useState("");
  const [notas, setNotas] = useState("");
  const [resumen, setResumen] = useState("");
  const [quiz, setQuiz] = useState<Pregunta[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);

  // 👇 Nuevos estados para respuestas y resultado
  const [respuestas, setRespuestas] = useState<{ [key: number]: string }>({});
  const [resultado, setResultado] = useState<{ correctas: number; total: number } | null>(null);

  // Cargar datos previos
  useEffect(() => {
    const saved = localStorage.getItem("cornellData");
    if (saved) {
      const data = JSON.parse(saved);
      setClaves(data.claves || "");
      setNotas(data.notas || "");
      setResumen(data.resumen || "");
    }
  }, []);

  // Guardar en localStorage
  const guardarCornell = () => {
    localStorage.setItem("cornellData", JSON.stringify({ claves, notas, resumen }));
    alert("✅ Método Cornell guardado correctamente.");
  };

  const limpiarCornell = () => {
    if (!confirm("¿Seguro que deseas borrar tus apuntes de Cornell?")) return;
    setClaves(""); setNotas(""); setResumen("");
    localStorage.removeItem("cornellData");
  };

  const imprimirNotas = () => window.print();

  function getTextoCorrecto(p: Pregunta): string {
    // Normalizamos la respuesta que viene en p.correcta
    const letra = p.correcta?.trim().toUpperCase() ?? "";

    // Mapa tipado de letras a índice
    const mapa: Record<"A" | "B" | "C" | "D", number> = { A: 0, B: 1, C: 2, D: 3 };

    // Si es una letra A-D, intentamos obtener la opción correspondiente de forma segura
    if (["A", "B", "C", "D"].includes(letra)) {
      const idx = mapa[letra as "A" | "B" | "C" | "D"];
      return p.opciones[idx] ?? p.correcta; // si no existe la opción, devolvemos p.correcta (seguro)
    }

    // Si no es una letra, devolvemos tal cual (puede ser ya la respuesta en texto)
    return p.correcta;
  }

  // 🔹 Generar quiz con IA
  const generarQuizIA = async () => {
    const datos = { claves, notas, resumen };
    if (!datos.claves && !datos.notas && !datos.resumen) {
      alert("❌ No hay información guardada para generar el quiz.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generar-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const data = await res.json();
      if (!data.preguntas) throw new Error("Respuesta inválida del servidor.");
      setQuiz(data.preguntas);
      setShowQuiz(true);
      setResultado(null);
      setRespuestas({});
    } catch (err) {
      console.error(err);
      alert("⚠️ Ocurrió un error al generar el quiz. Verifica tu conexión o clave API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 font-poppins text-gray-800 px-6 py-8">
      {/* Volver */}
      <a href="/menu" className="self-start text-indigo-700 hover:text-indigo-900 text-lg mb-4 font-medium transition">
        ← Volver al menú
      </a>

      {/* Título */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 text-center mb-8 drop-shadow-sm">
        Método Cornell
      </h1>

      {/* Contenedor principal */}
      <div className="w-full max-w-6xl bg-white/70 backdrop-blur-lg border border-indigo-100 shadow-xl rounded-2xl p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Palabras clave */}
          <div className="md:col-span-1 flex flex-col">
            <h2 className="flex items-center gap-2 text-indigo-800 font-semibold mb-2 text-lg">
              <i className='bx bxs-bulb text-2xl text-indigo-600'></i> Palabras clave
            </h2>
            <textarea
              value={claves}
              onChange={(e) => setClaves(e.target.value)}
              placeholder="Escribe aquí conceptos o preguntas clave..."
              className="w-full h-[350px] rounded-xl border border-indigo-200 bg-white/80 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 p-4 text-base resize-none transition"
            ></textarea>
          </div>

          {/* Notas principales */}
          <div className="md:col-span-2 flex flex-col">
            <h2 className="flex items-center gap-2 text-indigo-800 font-semibold mb-2 text-lg">
              <i className='bx bxs-edit text-2xl text-indigo-600'></i> Notas principales
            </h2>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escribe ideas principales, ejemplos o explicaciones..."
              className="w-full h-[350px] rounded-xl border border-indigo-200 bg-white/80 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 p-4 text-base resize-none transition"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="w-full max-w-6xl bg-white/70 backdrop-blur-lg border border-indigo-100 shadow-xl rounded-2xl p-8 mt-6">
        <h2 className="flex items-center gap-2 text-indigo-800 font-semibold mb-2 text-lg">
          <i className='bx bxs-book-content text-2xl text-indigo-600'></i> Resumen
        </h2>
        <textarea
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          placeholder="Redacta un breve resumen del tema..."
          className="w-full h-[250px] rounded-xl border border-indigo-200 bg-white/80 placeholder-gray-400 focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 p-4 text-base resize-none transition"
        ></textarea>
      </div>

      {/* Botones */}
      <div className="w-full max-w-6xl flex flex-wrap justify-center gap-5 mt-8">
        <button onClick={guardarCornell} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition">
          💾 Guardar
        </button>
        <button onClick={limpiarCornell} className="px-6 py-3 rounded-xl bg-gray-200 text-gray-800 font-semibold shadow-md hover:bg-gray-300 hover:-translate-y-0.5 transition">
          🧹 Limpiar
        </button>
        <button onClick={imprimirNotas} className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-md hover:bg-pink-600 hover:-translate-y-0.5 transition">
          🖨️ Descargar
        </button>
        <button onClick={generarQuizIA} className="px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold shadow-md hover:bg-teal-600 hover:-translate-y-0.5 transition">
          🤖 Generar Quiz (IA)
        </button>
      </div>

      {/* Modal del quiz */}
      {showQuiz && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-2xl p-6 relative">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
        <i className='bx bxs-graduation text-3xl text-indigo-600'></i> Quiz de repaso
      </h2>

      <div className="space-y-4 text-gray-800 max-h-[60vh] overflow-y-auto pr-2">
        {quiz.map((p, idx) => {
          const respuestaUsuario = respuestas[idx];
          const correcta = p.correcta;

          // Convertir letras a texto si es necesario
          let correctaTexto = correcta;
          const letra = correcta.trim().toUpperCase();

          if (["A", "B", "C", "D"].includes(letra)) {
            const mapaIndices: Record<"A" | "B" | "C" | "D", number> = { A: 0, B: 1, C: 2, D: 3 };
            const indice = mapaIndices[letra as "A" | "B" | "C" | "D"];
            const opcion = p.opciones[indice];
            if (opcion !== undefined) {
              correctaTexto = opcion;
            }
          }

          const esCorrecta = respuestaUsuario === correctaTexto;


          return (
            <div
              key={idx}
              className={`p-4 border rounded-xl transition ${
                resultado
                  ? esCorrecta
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50"
                  : "border-indigo-100 bg-indigo-50/50"
              }`}
            >
              <p className="font-medium mb-2">
                Pregunta {idx + 1}: {p.pregunta}
              </p>

              <div className="space-y-1">
                {p.opciones.map((op, i) => {
                  const seleccionada = respuestaUsuario === op;
                  const esOpcionCorrecta = op === correctaTexto;

                  return (
                    <label
                      key={i}
                      className={`block px-2 py-1 rounded-lg ${
                        resultado
                          ? esOpcionCorrecta
                            ? "text-green-700 font-semibold"
                            : seleccionada
                            ? "text-red-700"
                            : ""
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${idx}`}
                        className="mr-2"
                        disabled={!!resultado}
                        onChange={() =>
                          setRespuestas((prev) => ({ ...prev, [idx]: op }))
                        }
                      />
                      {op}
                    </label>
                  );
                })}
              </div>

              {/* Mostrar respuesta correcta solo después de enviar */}
              {resultado && !esCorrecta && (
                <p className="mt-2 text-sm text-green-700 font-medium">
                  ✅ Respuesta correcta: {correctaTexto}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ Evaluación y cierre */}
      {!resultado ? (
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => {
              let correctas = 0;

              quiz.forEach((p, idx) => {
                const respuestaUsuario = respuestas[idx];
                //const correcta = p.correcta;
                const correctaTexto = getTextoCorrecto(p);

                if (respuestaUsuario === correctaTexto) correctas++;

                /*let correctaTexto = correcta;
                if (["A", "B", "C", "D"].includes(correcta.trim().toUpperCase())) {
                  const indice = { A: 0, B: 1, C: 2, D: 3 }[correcta.trim().toUpperCase()];
                  correctaTexto = p.opciones[indice];
                }

                if (respuestaUsuario === correctaTexto) correctas++;*/
              });
              setResultado({ correctas, total: quiz.length });
            }}
            className="px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Enviar respuestas
          </button>
          <button
            onClick={() => setShowQuiz(false)}
            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <div className="mt-6 text-center">
          <p className="text-xl font-semibold text-indigo-700">
            🎯 Obtuviste {resultado.correctas} de {resultado.total} respuestas correctas
          </p>
          <button
            onClick={() => setResultado(null)}
            className="mt-3 px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  </div>
)}


      {/* Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/90 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-lg">
            <i className='bx bx-loader-alt bx-spin text-4xl text-indigo-600'></i>
            <p className="text-indigo-700 font-medium">Generando quiz con IA...</p>
          </div>
        </div>
      )}
    </div>
  );
}
