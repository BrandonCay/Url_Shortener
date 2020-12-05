import React, {useEffect} from 'react';
import {useParams, Redirect, useHistory} from 'react-router-dom'

const RedirectComp =()=>{
    const {short_url} = useParams();
    const history= useHistory();
    useEffect(()=>{
        fetch(`/api/shorturl/${short_url}`
        )//redirects to get
        .then((res)=>{            
            return res.json();
        }).then((data)=>{
            if( data.newUrl===null){ 
                history.push('/shorturl/notfound');
                return;
            }
            global.location.href=`${data.newUrl}`;
        }).catch((e)=>console.log(e));

    },[short_url])
    return(
      <div>
          Redirecting...
      </div>  
    )
}

export default RedirectComp;