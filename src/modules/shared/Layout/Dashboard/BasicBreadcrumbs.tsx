import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { prevNavigations } from '../../Slices/listeNavigationSlice';
import { Box } from '@mui/material';
import { useState } from 'react';


function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
}

export default function BasicBreadcrumbs() {

    const liste = useAppSelector((state: any) => state.navigations.navigations);
    const [taille, setTaille] = useState(0);
    React.useEffect(() => {
        if (liste) {
            setTaille(liste.length)
        }
    }, [liste])
    const classNameItem = "breadcrumb__item"
    const classNameFirst = "breadcrumb__item breadcrumb__first-item"
    const classNameLast = "breadcrumb__item breadcrumb__last-item"
    const dispatch = useAppDispatch();
    const prev = (title: string) => {
        dispatch(prevNavigations(title))
    }

    return (

        <ul className="breadcrumb">
            {liste?.map((item: { title: string; link: string }, key: number) => (
                <li key={item.link} className={key === 0 ? classNameFirst : key === taille - 1 ? classNameLast : classNameItem}>
                    <Link
                        key={item.link}
                        style={{ textDecoration: 'none' }}
                        onClick={() => { prev(item.title) }}
                        color="white"
                        to={item.link}
                        className="breadcrumb__title"
                    >
                        {item.title}
                    </Link>
                </li>
            ))}

        </ul>

    );
}
