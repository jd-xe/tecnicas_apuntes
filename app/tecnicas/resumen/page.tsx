"use client";
import { useState, useEffect, useRef } from "react";

interface Resumen {
  titulo: string;
  contenido: string;
  color: string;
  createdAt: number;
}

interface QuizQuestion {
  question: string;
  choices: string[];
  fullChoices: string[];
  correctIndex: number;
}

export default function ResumenPage() {
  const tituloRef = useRef<HTMLInputElement>(null);
  const contenidoRef = useRef<HTMLTextAreaElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const [resumenes, setResumenes] = useState<Resumen[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [quiz, setQuiz] = useState<{
    questions: QuizQuestion[];
    answers: (number | null)[];
    current: number;
  }>({ questions: [], answers: [], current: 0 });

  useEffect(() => {
    const data = localStorage.getItem("resumenesData");
    if (data) setResumenes(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("resumenesData", JSON.stringify(resumenes));
  }, [resumenes]);

  const nuevoResumen = () => {
    const titulo = tituloRef.current?.value.trim() || "";
    const contenido = contenidoRef.current?.value.trim() || "";
    const color = colorRef.current?.value || "#ffffff";
    if (!titulo || !contenido) return alert("⚠️ Escribe un título y contenido.");
    const nuevo: Resumen = { titulo, contenido, color, createdAt: Date.now() };
    setResumenes([nuevo, ...resumenes]);
    if (tituloRef.current) tituloRef.current.value = "";
    if (contenidoRef.current) contenidoRef.current.value = "";
  };

  const editarResumen = (index: number) => {
    const r = resumenes[index];
    if (!tituloRef.current || !contenidoRef.current || !colorRef.current) return;
    tituloRef.current.value = r.titulo;
    contenidoRef.current.value = r.contenido;
    colorRef.current.value = r.color || "#ffffff";
    setResumenes(resumenes.filter((_, i) => i !== index));
  };

  const eliminarResumen = (index: number) => {
    if (!confirm("¿Eliminar este resumen?")) return;
    setResumenes(resumenes.filter((_, i) => i !== index));
  };

  const limpiarResumenes = () => {
    if (!confirm("¿Deseas borrar todos los resúmenes?")) return;
    setResumenes([]);
  };

  const imprimirResumen = () => window.print();

  const generarQuizDesdeResumenes = (maxQuestions = 5) => {
    if (!resumenes || resumenes.length === 0) {
      const fallback = [
        { q: "¿Qué técnica ayuda a condensar la información en texto corto?", correct: "Resumen", options: ["Mapa mental", "Resumen", "Fichas"] },
        { q: "¿Cuál método divide la página en palabras clave, notas y resumen?", correct: "Cornell", options: ["Cornell", "Fichas", "Resumen"] },
        { q: "¿Qué técnica usa tarjetas para repasar?", correct: "Fichas", options: ["Resumen", "Fichas", "Mapa mental"] }
      ];
      startQuiz(fallback.map(f => ({
        question: f.q,
        choices: f.options,
        fullChoices: f.options,
        correctIndex: f.options.indexOf(f.correct)
      })));
      return;
    }

    const source = [...resumenes];
    shuffleArray(source);

    const questions: QuizQuestion[] = [];
    const limit = Math.min(maxQuestions, source.length);

    for (let i = 0; i < limit; i++) {
      const correct = source[i];
      const otherPool = source.filter((_, idx) => idx !== i);
      shuffleArray(otherPool);
      const distractors = otherPool.slice(0, 2).map(r => r.contenido);
      while (distractors.length < 2) distractors.push("Repasar después");
      const choices = [correct.contenido, ...distractors];
      shuffleArray(choices);
      questions.push({
        question: `¿Cuál es el resumen del tema “${correct.titulo}”?`,
        choices: choices.map(c => truncateText(c, 140)),
        fullChoices: choices,
        correctIndex: choices.indexOf(correct.contenido)
      });
    }

    startQuiz(questions);
  };

  const startQuiz = (questions: QuizQuestion[]) => {
    setQuiz({ questions, answers: Array(questions.length).fill(null), current: 0 });
    setModalOpen(true);
  };

  const selectAnswer = (idx: number) => {
    setQuiz(q => {
      const answers = [...q.answers];
      answers[q.current] = idx;
      localStorage.setItem("lastQuiz", JSON.stringify({ questions: q.questions, answers }));
      return { ...q, answers };
    });
  };

  const nextQuestion = () => {
    setQuiz(q => {
      if (q.current < q.questions.length - 1) return { ...q, current: q.current + 1 };
      alert("¡Quiz finalizado!");
      return q;
    });
  };

  const prevQuestion = () => {
    setQuiz(q => ({ ...q, current: Math.max(0, q.current - 1) }));
  };

  const closeQuizModal = () => setModalOpen(false);
  const shuffleArray = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } };
  const truncateText = (s: string, max = 120) => s.length > max ? s.slice(0, max).trim() + "…" : s;

  return (
    <div className="p-6 flex flex-col items-center min-h-screen font-handlee bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50">
      {/* Botón volver */}
      <a href="/menu" className="no-print fixed top-5 left-5 bg-white/80 text-blue-900 px-4 py-2 rounded-full shadow-md hover:bg-blue-100 transition flex items-center gap-2 z-30">
        <i className='bx bx-left-arrow-alt text-2xl'></i> Volver
      </a>

      <h1 className="text-4xl sm:text-5xl font-bold text-center text-blue-900 mt-10 mb-6 drop-shadow-md">📘 Método de Resumen</h1>

      {/* Contenedor resúmenes */}
      <div className="contenedor max-w-5xl w-full p-6 relative z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 no-print">
          <input
            ref={tituloRef}
            type="text"
            placeholder="Título del resumen"
            className="flex-1 border-2 border-blue-300 rounded-full p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <input
            ref={colorRef}
            type="color"
            defaultValue="#f0f9ff"
            className="rounded-full border-none w-16 h-12"
          />
          <button onClick={nuevoResumen} className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2">
            <i className='bx bx-plus'></i> Nuevo
          </button>
          <button onClick={() => generarQuizDesdeResumenes()} className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 flex items-center gap-2 ml-auto sm:ml-0">
            <i className='bx bx-question-mark'></i> Generar Quiz
          </button>
        </div>
        <textarea
          ref={contenidoRef}
          rows={8}
          placeholder="Escribe aquí tu resumen..."
          className="w-full p-3 border-2 border-blue-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
        />
        <div className="flex flex-wrap justify-center gap-4 mt-5 no-print">
          <button onClick={() => {}} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2">
            💾 Guardar
          </button>
          <button onClick={limpiarResumenes} className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 flex items-center gap-2">
            🧹 Limpiar
          </button>
          <button onClick={imprimirResumen} className="bg-gradient-to-br from-pink-500 to-pink-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2">
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* Resúmenes guardados */}
      <h2 className="text-2xl sm:text-3xl font-semibold text-blue-800 mt-10 mb-4">📑 Mis Resúmenes</h2>
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 mb-12 relative z-10">
        {resumenes.map((r, i) => (
          <div
            key={r.createdAt}
            style={{ background: r.color }}
            className="relative p-5 rounded-3xl shadow-lg border border-blue-100 hover:shadow-2xl transition-shadow duration-300 group"
          >
            {/* Botones solo íconos */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                className="bg-white/90 hover:bg-white text-blue-600 rounded-full p-2 shadow-md flex items-center justify-center"
                onClick={() => editarResumen(i)}
              >
                <i className="bx bx-edit text-lg"></i>
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md flex items-center justify-center"
                onClick={() => eliminarResumen(i)}
              >
                <i className="bx bx-trash text-lg"></i>
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3">{r.titulo}</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{r.contenido}</p>
          </div>
        ))}
      </div>

      {/* Modal Quiz */}
      {modalOpen && (
        <div className="modal-bg fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="modal bg-white rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-auto w-[90%] md:w-[720px] flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">📝 Quiz</h2>
            {quiz.questions.length > 0 && (
              <>
                <div className="text-gray-800">
                  <p className="mb-3 font-semibold">
                    Pregunta {quiz.current + 1} / {quiz.questions.length}:
                  </p>
                  <p className="mb-4 text-gray-700">{quiz.questions[quiz.current].question}</p>
                  <div className="flex flex-col gap-2">
                    {quiz.questions[quiz.current].choices.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(idx)}
                        className={`text-left px-4 py-2 rounded-xl border ${
                          quiz.answers[quiz.current] === idx ? "bg-blue-200 border-blue-500" : "bg-white border-gray-300"
                        } hover:bg-blue-100 transition`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button onClick={prevQuestion} className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition">Anterior</button>
                  <button onClick={nextQuestion} className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition">Siguiente</button>
                </div>
              </>
            )}
            <button onClick={closeQuizModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition self-center">Cerrar Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
}
