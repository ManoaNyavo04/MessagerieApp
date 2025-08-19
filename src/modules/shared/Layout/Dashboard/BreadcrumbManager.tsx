import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux-hooks';
import { addNavigation, resetNavigations } from '../../Slices/listeNavigationSlice';

// Une correspondance entre les routes et leurs titres
const routeMap: Record<string, string> = {
  '/messagerie': 'Discussion',
  '/gestion-utilisateur': 'Gestion utilisateur',
//   '/': 'Accueil',
  // ajoute d'autres routes ici
};

const BreadcrumbManager = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const path = location.pathname;
    const title = routeMap[path];

    if (title) {
      dispatch(resetNavigations()); // vide le précédent
      dispatch(addNavigation({ title, link: path }));
    }
  }, [location.pathname]); // se déclenche à chaque changement de route

  return null; // Ce composant n'affiche rien
};

export default BreadcrumbManager;
