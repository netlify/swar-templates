import { createFileRoute } from '@tanstack/react-router'
import { allProjects } from 'content-collections'
import { Badge } from '../components/ui/badge'
import { pageMeta } from '../lib/site'

export const Route = createFileRoute('/projects')({
  component: Projects,
  head: () =>
    pageMeta(
      'Work',
      'Selected projects, their implementation details, and technologies.',
    ),
})

function Projects() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Projects</h1>
      <p className="text-gray-600 mb-8">
        A selection of example projects and how they were built.
      </p>
      {allProjects.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allProjects.map((project) => (
            <article
              key={project._meta.path}
              id={project._meta.path}
              className="min-w-0 rounded-xl border shadow-sm overflow-hidden scroll-mt-8"
            >
              {project.image && (
                <img
                  src={project.image}
                  alt={project.imageAlt ?? project.title}
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3">{project.title}</h2>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div
                  className="prose prose-sm max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: project.html }}
                />
                <div className="flex flex-wrap gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-sm"
                    >
                      Source on GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-sm"
                    >
                      View project
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No projects published yet.</p>
      )}
    </div>
  )
}
