import { createElement } from 'react';

const Status = ({text, icon, bg, color}) => {
    return(
        <div className={`flex items-center gap-1 px-2 py-2 font-medium rounded-full ${bg} ${color}`}>
            {icon ? createElement(icon, { size: 16 }) : null}
            {text}
        </div>
    )
}

export default Status;