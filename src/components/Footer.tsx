import React from 'react';
import '../styles/Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <>
            <footer className='flex flex-col grid content-end'>
                <span className='text-4xl'>ⓒ {currentYear} Freelance PayGuard</span>
                <div className='flex flex-row justify-center gap-26'>
                    <p className='text-2xl tos'>이용약관</p>
                    <p className='text-2xl policy'>개인정보 처리방침</p>
                </div>
            </footer>
        </>
    );
}

export default Footer;