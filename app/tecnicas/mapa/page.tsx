"use client";
import React, { useCallback, useRef, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";
import html2canvas from "html2canvas";

export default function MapaMentalFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [color, setColor] = useState("#f472b6");
  const flowRef = useRef<HTMLDivElement>(null);

  // Cargar desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mapaMentalFlow");
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      setNodes(nodes);
      setEdges(edges);
    } else {
      setNodes([
        {
          id: "1",
          data: { label: "Idea principal 🧠" },
          position: { x: 250, y: 200 },
          style: { backgroundColor: "#fbcfe8", padding: 10, borderRadius: 15 },
        },
      ]);
    }
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    localStorage.setItem("mapaMentalFlow", JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // Conexión
  const onConnect: OnConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: "#a855f7" } }, eds)
      ),
    []
  );

  // Añadir nodo
  const agregarNodo = () => {
    if (!nuevoTexto.trim()) return alert("Escribe algo para el nodo.");
    const nuevo: Node = {
      id: (nodes.length + 1).toString(),
      data: { label: nuevoTexto },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      style: {
        backgroundColor: color,
        padding: 10,
        borderRadius: 15,
        color: "white",
        fontWeight: "bold",
      },
    };
    setNodes((nds) => [...nds, nuevo]);
    setNuevoTexto("");
  };

  // Limpiar mapa
  const limpiarMapa = () => {
    if (!confirm("¿Deseas borrar todos los nodos y conexiones?")) return;
    setNodes([]);
    setEdges([]);
  };

  // Exportar imagen (html2canvas)
  const exportarImagen = async () => {
  if (!flowRef.current) return;

  try {
    // 🔹 Ocultar minimapa y controles temporalmente
    const miniMap = flowRef.current.querySelector(".react-flow__minimap");
    const controls = flowRef.current.querySelector(".react-flow__controls");
    if (miniMap) miniMap.style.display = "none";
    if (controls) controls.style.display = "none";

    // 🔹 Generar la imagen
    const canvas = await html2canvas(flowRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    // 🔹 Restaurar visibilidad
    if (miniMap) miniMap.style.display = "";
    if (controls) controls.style.display = "";

    // 🔹 Descargar imagen
    const dataUrl = canvas.toDataURL("image/png");
    const enlace = document.createElement("a");
    enlace.href = dataUrl;
    enlace.download = "mapa-mental.png";
    enlace.click();
  } catch (err) {
    console.error("Error al exportar imagen:", err);
    alert("❌ No se pudo exportar la imagen.");
  }
};


  // Editar texto (doble clic)
  const handleNodeDoubleClick = (_: any, node: Node) => {
    const nuevoLabel = prompt("✏️ Editar texto del nodo:", node.data.label);
    if (nuevoLabel === null || nuevoLabel.trim() === "") return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, label: nuevoLabel } } : n
      )
    );
  };

  // Eliminar nodo/conexión (clic derecho)
  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    if (confirm(`¿Eliminar el nodo "${node.data.label}"?`)) {
      setNodes((nds) => nds.filter((n) => n.id !== node.id));
      setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
    }
  };

  const handleEdgeContextMenu = (event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    if (confirm("¿Eliminar esta conexión?")) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
  };

  return (
    <div
      className="h-screen w-full font-handlee"
      style={{
        background: "linear-gradient(135deg, #bfdbfe 0%, #fbcfe8 50%, #fce7f3 100%)",
      }}
    >
      {/* Volver */}
      <a
        href="/menu"
        className="absolute top-4 left-4 text-blue-700 underline text-lg z-50"
      >
        ← Volver al menú
      </a>

      <h1 className="text-4xl font-bold text-center text-pink-700 pt-10 mb-6 drop-shadow-md">
        🧩 Mapa Mental
      </h1>

      {/* Controles */}
      <div className="flex justify-center items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder="Texto del nodo"
          className="border-2 border-pink-300 text-gray-800 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-400 bg-white/90"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="rounded-xl border-none w-14 h-10 cursor-pointer"
        />
        <button
          onClick={agregarNodo}
          className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition"
        >
          ➕ Añadir Nodo
        </button>
        <button
          onClick={limpiarMapa}
          className="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 transition"
        >
          🧹 Limpiar
        </button>
        <button
          onClick={exportarImagen}
          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        >
          📸 Exportar Imagen
        </button>
      </div>

      {/* Área de React Flow */}
      <div
        ref={flowRef}
        style={{
          width: "90%",
          height: "75vh",
          background: "rgba(255,255,255,0.8)",
          borderRadius: "1rem",
          border: "1px solid #f9a8d4",
          margin: "auto",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={handleNodeContextMenu}
          onEdgeContextMenu={handleEdgeContextMenu}
          fitView
        >
          <Background color="#e9d5ff" gap={16} />
          <MiniMap
            nodeColor={(n) => (n.style?.backgroundColor as string) || "#ccc"}
            maskColor="rgba(240, 240, 255, 0.6)"
          />
          <Controls />
        </ReactFlow>
      </div>

      <p className="text-center text-sm text-gray-600 mt-3">
        💡 Doble clic para editar texto. Clic derecho para eliminar nodo o conexión.
      </p>
    </div>
  );
}
