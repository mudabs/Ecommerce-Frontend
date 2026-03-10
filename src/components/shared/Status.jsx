const Status = ({text, icon:IconBase, bg, color}) => {
    return(
        <div className={`flex items-center gap-1 px-2 py-2 font-medium rounded-full ${bg} ${color}`}>
            <IconBase size={16}/>
            {text}
        </div>
    )
}

export default Status;