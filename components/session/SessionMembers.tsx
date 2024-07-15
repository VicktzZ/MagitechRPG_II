/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Box, Divider, Typography, useTheme } from '@mui/material'
import Image from 'next/image'
import React, { type ReactElement, useEffect, useState, useMemo } from 'react'
import type { Member } from '@types'
import type { PresenceChannel } from 'pusher-js'
import { useGameMasterContext } from '@contexts/gameMasterContext'
import { useForceUpdate } from '@mantine/hooks'

export default function SessionMembers({ members }: { members: PresenceChannel['members'] }): ReactElement {
    const theme = useTheme()
    const { allGameMasters } = useGameMasterContext()
    const [ membersArr, setMembersArr ] = useState<Member[]>([])
    const forceUpdate = useForceUpdate()

    const membersArray = useMemo((): Member[] => {
        const myId: string = members?.me?.info._id;
        const arr = Object?.values<Member>(members?.members as Record<string, Member>);
        
        const sortedArr = arr.sort((a, b) => {
            if (allGameMasters.includes(a._id)) {
                return -1
            } else if (allGameMasters.includes(b._id)) {
                return 1
            } else if (a._id === myId || b._id === myId) {
                return -1
            } else {
                return 0
            }
        })

        return sortedArr;
    }, [ members?.members, members?.me?.info._id, allGameMasters ]);

    useEffect(() => {
        forceUpdate();
        setMembersArr(membersArray);
    }, [ members.members, members, membersArray ]);

    return (
        <Box
            border={`1px solid ${theme.palette.primary.main}`}
            height='100%'
            width={250}
            p={2}
            borderRadius={2}
        >
            {
                membersArr ?
                    membersArr.map((member: Member) => {
                        if (allGameMasters.includes(member._id)) {
                            return (
                                <Box key={member._id}>
                                    <Box
                                        display='flex'
                                        key={member._id}
                                        m={'20px 0'}
                                        gap={2}
                                        alignItems='center'
                                    >
                                        <Avatar
                                            sx={{
                                                border: '2px solid yellow'
                                            }}
                                        >
                                            {
                                                member.image ? (
                                                    <Image
                                                        height={250}
                                                        width={250}
                                                        style={{ height: '100%', width: '100%' }} 
                                                        src={member.image}
                                                        alt={member.name.charAt(0).toUpperCase()}
                                                    />
                                                ) : (
                                                    member.name.charAt(0).toUpperCase()
                                                )
                                            }
                                        </Avatar>
                                        <Box display='flex' gap={0.1} flexDirection='column'>
                                            <Typography noWrap>Game Master</Typography>
                                            <Typography color='text.secondary' variant='caption' noWrap>{member.name}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider />
                                </Box>
                            )
                        }

                        if (member._id === members.me.info._id && !allGameMasters.includes(member._id)) {
                            return (
                                <Box
                                    display='flex'
                                    key={member._id}
                                    m={'20px 0'}
                                    gap={2}
                                    alignItems='center'
                                >
                                    <Avatar
                                        sx={{
                                            border: '2px solid blue'
                                        }}
                                    >
                                        {
                                            member.image ? (
                                                <Image
                                                    height={250}
                                                    width={250}
                                                    style={{ height: '100%', width: '100%' }} 
                                                    src={member.image}
                                                    alt={member.name.charAt(0).toUpperCase()}
                                                />
                                            ) : (
                                                member.name.charAt(0).toUpperCase()
                                            )
                                        }
                                    </Avatar>
                                    <Box display='flex' gap={0.1} flexDirection='column'>
                                        <Typography noWrap>{member.currentFicha.name}</Typography>
                                        <Typography color='text.secondary' variant='caption' noWrap>{member.name}</Typography>
                                    </Box>
                                </Box>
                            )
                        }

                        return (
                            <>
                                {
                                    member._id !== members.me.info._id && !allGameMasters.includes(member._id) && (
                                        <Box
                                            display='flex'
                                            key={member._id}
                                            m={'20px 0'}
                                            gap={2}
                                            alignItems='center'
                                        >
                                            <Avatar>
                                                {
                                                    member.image ? (
                                                        <Image
                                                            height={250}
                                                            width={250}
                                                            style={{ height: '100%', width: '100%' }} 
                                                            src={member.image}
                                                            alt={member.name.charAt(0).toUpperCase()}
                                                        />
                                                    ) : (
                                                        member.name.charAt(0).toUpperCase()
                                                    )
                                                }
                                            </Avatar>
                                            <Box display='flex' gap={0.1} flexDirection='column'>
                                                <Typography noWrap>{member.currentFicha.name}</Typography>
                                                <Typography color='text.secondary' variant='caption' noWrap>{member.name}</Typography>
                                            </Box>
                                        </Box>
                                    )
                                }
                            </>
                        )
                    }) : 'Carregando...'
            }
        </Box>
    )
}