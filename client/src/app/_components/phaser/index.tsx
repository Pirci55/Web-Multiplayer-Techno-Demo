'use client';
import styles from './index.module.scss';
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import PreloadScene from './scenes/preload_scene';
import MainScene from './scenes/main_scene';

export default function () {
    const gameRef = useRef<Phaser.Game>(null);

    useEffect(() => {
        gameRef.current = new Phaser.Game({
            type: Phaser.WEBGL,
            antialiasGL: true,
            antialias: false,
            roundPixels: true,
            parent: 'render',
            backgroundColor: '#201020',
            physics: {
                default: 'matter',
                matter: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scene: [PreloadScene, MainScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
            }
        });

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return <div className={styles.render} id='render'></div>;
};
