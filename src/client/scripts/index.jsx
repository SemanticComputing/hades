import React                    from 'react';
import { render }               from 'react-dom';
import { createHistory }        from 'history';
import App                      from './App';

const history  = createHistory();

const initialView = (
    <App history={history}/>
);

render(initialView, document.getElementById('hades'));
