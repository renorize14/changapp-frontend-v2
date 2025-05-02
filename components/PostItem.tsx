import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';
import env from '../config/env';

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    nickname: string;
    category: string;
    basketball: boolean;
    basketball3x3: boolean;
    football7: boolean;
    football5: boolean;
    birthdate: string;
    geoReference: string;
    profilePhoto: string | null;
  }

export default function PostItem({ item, userData, definePostToDelete, setShowDeleteModal }: any) {
    const [liked, setLiked] = useState(item.likedByUser);
    const [likesCount, setLikesCount] = useState(item.likesCount);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const { token } = useAuth();
    

    useEffect(() => {
        if (commentsVisible) fetchComments();

    }, [commentsVisible]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${env.API_URL}comments/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setComments(data);
        } catch (err) {
            console.error('Error al obtener comentarios:', err);
        }
    };

    const postComment = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await fetch(`${env.API_URL}comments/${item._id}/${item.user_id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userData.id,
                    userNickname: userData.nickname,
                    body: newComment,
                    profilePicture : userData.profilePhoto
                }),
            });

            if (response.ok) {
                setNewComment('');
                fetchComments();
            }
        } catch (err) {
            console.error('Error al comentar:', err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
          const res = await fetch(`${env.API_URL}comments/${commentId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (res.ok) {
            fetchComments(); 
          } else {
            console.error('Error al eliminar comentario');
          }
        } catch (err) {
          console.error('Error de red al eliminar comentario:', err);
        }
      };

    function getDistanceFromLatLonInKm(geo: string): number {
        let lat1 = parseFloat(userData?.geoReference.split(",")[0] || "");
        let lon1 = parseFloat(userData?.geoReference.split(",")[1] || "");
        let lat2 = parseFloat(geo.split(",")[0]);
        let lon2 = parseFloat(geo.split(",")[1]);
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    const toggleLike = async () => {
        try {
            const response = await fetch(
                `${env.API_URL}likes/${item._id}/${liked ? 'unlike' : 'like'}?userId=${userData.id}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.ok) {
                setLiked(!liked);
                setLikesCount(( prev: any) => prev + (liked ? -1 : 1));
            }
        } catch (err) {
            console.error('Error al dar like:', err);
        }
    };

    return (
        <View style={styles.post}>
            <View style={styles.postHeader}>
            <Image
                source={
                    item.profilePicture
                    ? { uri: item.profilePicture }
                    : require('../assets/images/default-avatar.png') // Ruta a tu imagen por defecto
                }
                style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.user}>{item.nickname}</Text>
                    <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
                    <Text style={styles.time}>{item.sport} - {item.topic}</Text>
                    <Text style={styles.time}>📍a {getDistanceFromLatLonInKm(item.georeference || ",").toFixed(2)} km de distancia</Text>
                </View>

                {userData?.id === item.user_id && (
                    <TouchableOpacity
                        onPress={() => {
                            definePostToDelete(item._id);
                            setShowDeleteModal(true);
                        }}
                    >
                        <Icon name="trash" size={20} color="red" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.content}>{item.body}</Text>

            <View style={styles.postFooter}>
                <TouchableOpacity onPress={toggleLike} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                        name="thumbs-up"
                        size={20}
                        color={liked ? '#007bff' : '#555'}
                        style={styles.iconFooter}
                    />
                    <Text style={{ marginLeft: 0 }}>{likesCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginLeft: 15 }}
                    onPress={() => setCommentsVisible(!commentsVisible)}
                >
                    <Icon name="comment" size={20}  color={commentsVisible ? '#28a745' : '#555'}/>
                </TouchableOpacity>
            </View>

            {commentsVisible && (
                <View style={{ marginTop: 10 }}>
                    <FlatList
                        data={comments}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.commentRow}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.postHeader}>
                                    <Image
                                        source={
                                            item.profilePicture
                                            ? { uri: item.profilePicture }
                                            : require('../assets/images/default-avatar.png') // Ruta a tu imagen por defecto
                                        }
                                        style={styles.avatar}
                                        />
                                        <Text style={{ fontWeight: 'bold' }}>{item.userNickname}</Text>
                                    </View>
                                
                                    <Text>{item.body}</Text>
                                </View>
                                {item.userId == userData.id && (
                                    
                                    <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                                        <Icon name="trash" size={16} color="red" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                    <TextInput
                        value={newComment}
                        onChangeText={setNewComment}
                        placeholder="Escribe un comentario..."
                        style={styles.commentInput}
                        multiline
                    />
                    <TouchableOpacity onPress={postComment} style={styles.commentButton}>
                        <Text style={{ color: 'white' }}>Comentar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 2,
    },
    radioGroup: {
        flex: 1,
        marginRight: 10,
        color: "#ffffff",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "#1a5081"
    },
    radioLabel: {
        fontSize: 14,
        color: "#ffffff",
    },
    publicationsContainer: {
        flex: 1,
        backgroundColor: '#1E5D96',
        paddingHorizontal: 20,
        paddingTop: 50,

    },
    publicationsLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: "#ffffff",
        textAlign: 'center'
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        height: 100,
        padding: 10,
        marginTop: 10,
        marginBottom: 20,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#0a4ea1',
        paddingHorizontal: 15,
        paddingTop: 60,
        resizeMode: 'cover',
    },

    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    newPostBox: {
        backgroundColor: '#4682B4',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    newPostText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    postsContainer: {
        paddingBottom: 20,
    },
    post: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ccc',
        marginRight: 10,
    },
    user: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        color: '#555',
        fontSize: 12,
    },
    content: {
        fontSize: 14,
        marginVertical: 10,
        color: '#333',
    },
    postFooter: {
        flexDirection: 'row',
        marginTop: 10,
    },
    iconFooter: {
        marginRight: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        resizeMode: 'cover',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000000'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#28a745',
        color: 'white'
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        marginBottom: 16,
        fontWeight: 'bold',
        color: "#ffffff"
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    commentInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginTop: 10,
      },
      commentButton: {
        marginTop: 5,
        backgroundColor: '#1a5081',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
      },
      commentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: '#f2f2f2',
        padding: 8,
        borderRadius: 6,
      },
});
