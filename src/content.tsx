import './content.css';

import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import ContentPage from './components/ContentPage/ContentPage';

const root = document.createElement('div');
root.id = '__leetcode_ai_lifenode_container';
document.body.append(root);

createRoot(root).render(
  <StrictMode>
    <ContentPage />
  </StrictMode>
);
