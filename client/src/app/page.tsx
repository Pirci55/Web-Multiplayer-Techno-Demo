'use client';
import styles from './page.module.scss';
import dynamic from 'next/dynamic';
import Chat from './_components/chat';

// Костыль next.js для отключения ssr
const Phaser = dynamic(
    () => import('./_components/phaser'),
    { ssr: false }
);

export default function Page() {
    return <div className={styles.game_container}>
        <Phaser />
        <Chat />
    </div>;
};