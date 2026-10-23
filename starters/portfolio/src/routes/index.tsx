import { createFileRoute, Link } from '@tanstack/react-router'
import { allBlogs, allProjects } from 'content-collections'
import { site, pageMeta } from '../lib/site'
import { newestPosts } from '../lib/chronology'

export const Route = createFileRoute('/')({
  component: PortfolioHome,
  head: () => pageMeta('Portfolio', site.description),
})

function PortfolioHome() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <section>
        <p className="text-sm text-gray-600 mb-3">Example portfolio</p>
        <h1 className="text-4xl font-bold mb-3">
          {site.name}, {site.role.toLowerCase()}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-6">{site.summary}</p>
        <div className="flex flex-wrap gap-5">
          <Link to="/projects" className="font-semibold underline">
            Explore my work
          </Link>
          <Link to="/contact" className="font-semibold underline">
            Get in touch
          </Link>
        </div>
      </section>
      <section aria-labelledby="featured-work">
        <h2 id="featured-work" className="text-2xl font-bold mb-6">
          Selected work
        </h2>
        {allProjects.length ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {allProjects.slice(0, 2).map((project) => (
              <article
                key={project._meta.path}
                className="border rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                <p className="mb-4 text-gray-600">{project.description}</p>
                <Link
                  to="/projects"
                  hash={project._meta.path}
                  className="underline"
                >
                  Read about {project.title}
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p>No projects published yet.</p>
        )}
      </section>
      <section aria-labelledby="latest-writing">
        <h2 id="latest-writing" className="text-2xl font-bold mb-6">
          Latest writing
        </h2>
        {allBlogs.length ? (
          <ul className="space-y-4">
            {newestPosts(allBlogs)
              .slice(0, 3)
              .map((post) => (
                <li key={post.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="underline font-medium"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-gray-600">{post.summary}</p>
                </li>
              ))}
          </ul>
        ) : (
          <p>No posts published yet.</p>
        )}
        <Link to="/blog" className="inline-block mt-6 underline">
          All blog posts
        </Link>
      </section>
    </div>
  )
}
