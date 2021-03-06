import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import React from 'react';
import appConfig from '../config.json';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'; // importa componente do botao de Sticker

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI4NzAwMiwiZXhwIjoxOTU4ODYzMDAyfQ.54dIt7MF3_fwil80a47PatTCrwnR_CIe_BmeTqh6jw4';
const SUPABASE_URL = 'https://lpwawywzpwbjqacjydso.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagemEmTempoReal(adicionaMensagem) {
    // Houve uma nova mensagem
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (respostaAutomatica) => {
            adicionaMensagem(respostaAutomatica.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;


    const [mensagem, setMensagem] = React.useState('');
    const [chatMensagens, setChatMensagens] = React.useState([]);

    // Obtem dados do banco de dados do Supabase
    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                // console.log("Dados da consulta: ", data);
                setChatMensagens(data)
            });
        escutaMensagemEmTempoReal((novaMensagem) => {
            setChatMensagens(() => {
                return [
                    novaMensagem,
                    ...chatMensagens,
                ]
            }
            );
        });
    }, [chatMensagens])

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            de: usuarioLogado,
            texto: novaMensagem,

        };

        // Insere dados no supabase e na lista de mensagens
        supabaseClient.from('mensagens')
            .insert([
                mensagem
            ])
            .then(({ data }) => {
                // Guardar na lista a mensagem
            }
            )
        // Limpar campo
        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[300],
                backgroundImage: 'url(https://cdn.pixabay.com/photo/2017/02/08/17/24/fantasy-2049567__340.jpg)',
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '80%',
                    maxWidth: '70%',
                    maxHeight: '90vh',
                    padding: '32px',
                }}
            >
                <Header usuario={usuarioLogado} />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    {<MessageList mensagens={chatMensagens} />}
                    {/* {chatMensagens.map((mensagemAtual) => {
                        return (
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )
                    })} */}


                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    // Evitar a quebra de linha
                                    event.preventDefault();
                                    if (mensagem) { // verifica se a mensagem est?? vazia
                                        handleNovaMensagem(mensagem);
                                    }
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                //console.log('salva sticker no banco');
                                handleNovaMensagem(':sticker:' + sticker);
                            }
                            }
                        />
                        <Button
                            onClick={() => {
                                if (mensagem) { // verifica se a mensagem est?? vazia
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            label='Enviar'
                            styleSheet={{
                                minWidth: '40px',
                                minHeight: '40px',
                                color: appConfig.theme.colors.neutrals[100],
                                backgroundColor: appConfig.theme.colors.neutrals['011'],
                                transition: "0.5s",
                                marginBottom: "6px",
                                hover: {
                                    backgroundColor: appConfig.theme.colors.neutrals['010'],
                                },
                            }}
                            buttonColors={{
                                mainColorStrong: appConfig.theme.colors.neutrals['010'],
                            }}
                        />

                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header(props) {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Box styleSheet={{ width: '100%', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'left', gap: '4px' }} >

                    {<Image
                        styleSheet={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'inline-block',
                            marginRight: '8px',
                        }}
                        src={`https://github.com/${props.usuario}.png`}
                    />}

                    <Text
                        variant='heading5'
                        tag='a'
                        href={`https://github.com/${props.usuario}`}
                        target='_blank'
                        styleSheet={{
                            color: appConfig.theme.colors.neutrals['000'],
                            textDecoration: 'none'
                        }}>
                        {props.usuario}
                    </Text>

                </Box>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    //console.log('MessageList', props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagemAtual) => {
                return (
                    <Text
                        key={mensagemAtual.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagemAtual.de}.png`}
                            />
                            <Text tag="strong"
                                tag='a'
                                href={`https://github.com/${mensagemAtual.de}`}
                                target='_blank'
                                styleSheet={{
                                    color: appConfig.theme.colors.neutrals['000'],
                                    textDecoration: 'none'
                                }}>
                                {mensagemAtual.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>

                        {/* Come??a com :sticker: ? entao exibe o sticker senao exibe o texto */}
                        {mensagemAtual.texto.startsWith(':sticker:')
                            ? (
                                <Image
                                    styleSheet={{
                                        width: '80px',
                                        height: '80px',
                                    }}
                                    src={mensagemAtual.texto.replace(':sticker:', '')} />
                            )
                            : (
                                mensagemAtual.texto
                            )}


                    </Text>
                );
            })}

        </Box>
    )
}