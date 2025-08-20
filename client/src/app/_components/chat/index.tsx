'use client';
import styles from './index.module.scss';
import { ColyseusService } from '@/app/_lib/colyseus';
import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useRef,
    useState
} from 'react';

export default function Chat() {
    const [text, setText] = useState('');
    const ulRef = useRef<HTMLUListElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const pushMessage = (content: any) => {
        const element = document.createElement('li');
        element.textContent = content;

        if (ulRef.current) {
            ulRef.current.appendChild(element);
            ulRef.current.scrollTop = ulRef.current.scrollHeight;
        };
    };

    useEffect(() => {
        const room = (async () => {
            const room = await ColyseusService.joinRoom('main_room');

            room.onMessage('player_join', (data: any) => {
                pushMessage('server: ' + data.sessionId + ' connected');
            });

            room.onMessage('player_left', (data: any) => {
                pushMessage('server: ' + data.sessionId + ' disconnected');
            });

            room.onMessage('broadcast_message', (data: any) => {
                pushMessage(data.content);
                const audio = new Audio('/new_message.mp3');
                audio.volume = 0.1;
                audio.play();
            });

            room.onMessage('room_dispose', (data: any) => {
                pushMessage('server: room ' + data.sessionId + ' dispose');
            });
            
            return room;
        })();

        return () => { room.then(room => room.removeAllListeners()); };
    }, []);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const room = await ColyseusService.joinRoom('main_room')
        room.send('new_message', { content: text });

        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={styles.chat}>
            <ul className={styles.messages} ref={ulRef}></ul>
            <form className={styles.form} onSubmit={onSubmit}>

                <input className={styles.textInput}
                    type='text'
                    placeholder='messgae'
                    ref={inputRef}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
                    onFocus={() => document.body.dispatchEvent(new CustomEvent('disable_input'))}
                    onBlur={() => document.body.dispatchEvent(new CustomEvent('enable_input'))}
                />

                <input className={styles.submitButton}
                    type='submit'
                    value=' > '
                />

            </form>
        </div>
    );
}
