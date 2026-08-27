"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Spinner from "../../../../components/ui/Spinner";
import ProjectDetail from "../../../../components/projects/ProjectDetail";
import { getProject } from "../../../../services/projects.service";

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getProject(id)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-8">
        <Spinner />
        <span className="text-brand-text/70">Cargando proyecto...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-brand-error">{error}</p>;
  }

  return <ProjectDetail project={project} />;
}
