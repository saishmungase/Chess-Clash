import '../index.css'
import chessboard from '../assets/chess-landing.jpg'
import { useNavigate } from 'react-router-dom'

export const Landing = () =>{
    const navigate = useNavigate();

    return <div className="h-full w-full p-0 m-0 bg-black ">
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div >
                <img className='rounded-2xl duration-300 hover:shadow-lg hover:shadow-white' src={chessboard}></img>
            </div>
            <div className='flex justify-center flex-col gap-4 bg-black'>
                <h2 className='text-7xl'>LET THE WAR BEGINS 🚩</h2>
                <div>
                    <button className='w-13 bg-white text-black' onClick={()=>{
                        navigate('/game')
                    }}>
                        Play Now !
                    </button>
                </div>
            </div>
        </div>
    </div>
}