import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/common';
import {
  OverviewPage,
  BooksPage,
  BookDetailPage,
  AuthorsPage,
  AuthorDetailPage,
  SeriesPage,
  SeriesDetailPage,
} from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <OverviewPage />
      </Layout>
    ),
  },
  {
    path: '/books',
    element: (
      <Layout>
        <BooksPage />
      </Layout>
    ),
  },
  {
    path: '/books/:id',
    element: (
      <Layout>
        <BookDetailPage />
      </Layout>
    ),
  },
  {
    path: '/authors',
    element: (
      <Layout>
        <AuthorsPage />
      </Layout>
    ),
  },
  {
    path: '/authors/:id',
    element: (
      <Layout>
        <AuthorDetailPage />
      </Layout>
    ),
  },
  {
    path: '/series',
    element: (
      <Layout>
        <SeriesPage />
      </Layout>
    ),
  },
  {
    path: '/series/:id',
    element: (
      <Layout>
        <SeriesDetailPage />
      </Layout>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
