"use client";
import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import { postData } from '../../services/apiService';
import Swal from 'sweetalert2';


export default function LoginPage() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // Estado para manejar la visibilidad de la contraseña

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Cambiar el estado al hacer clic
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        try {
            const response = await postData({ endpoint: 'user/auth', data: formData });

            // Manejar la respuesta de éxito, como redirigir a otra página
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: '¡Has iniciado sesión correctamente!',
            });
            console.log('Respuesta de la API:', response);
            // Redireccionar o realizar otra acción después de un inicio de sesión exitoso
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al enviar el formulario.',
            });
        }
    };


    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <div className={styles.containerLeft}>
                    <div className={styles.authenticationContainer}>
                        <div className={styles.authentication}>
                            <div className={styles.containerImg}>
                                <img src="/food.svg" alt="Store Icon" className={styles.icon} />
                            </div>
                            <div className={styles.containerTitle}>
                                <h4 className={styles.title}>Transforma tu negocio con True Love Portal</h4>
                            </div>
                            <div className={styles.features}>
                                <div className={styles.featuresContainer}>
                                    <div className={styles.featuresIcon}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="chart"><mask id="mask0_8155_943" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect id="Bounding box" width="24" height="24" fill="#D9D9D9"></rect></mask><g mask="url(#mask0_8155_943)"><path id="Icon" d="M8.11538 16.75C8.32819 16.75 8.50639 16.6782 8.64998 16.5346C8.79356 16.391 8.86535 16.2128 8.86535 16V11C8.86535 10.7872 8.79356 10.609 8.64998 10.4654C8.50639 10.3218 8.32819 10.25 8.11538 10.25C7.90256 10.25 7.72436 10.3218 7.58078 10.4654C7.43718 10.609 7.36538 10.7872 7.36538 11V16C7.36538 16.2128 7.43718 16.391 7.58078 16.5346C7.72436 16.6782 7.90256 16.75 8.11538 16.75ZM12 16.75C12.2128 16.75 12.391 16.6782 12.5346 16.5346C12.6782 16.391 12.75 16.2128 12.75 16V7.99998C12.75 7.78716 12.6782 7.60896 12.5346 7.46538C12.391 7.32179 12.2128 7.25 12 7.25C11.7872 7.25 11.609 7.32179 11.4654 7.46538C11.3218 7.60896 11.25 7.78716 11.25 7.99998V16C11.25 16.2128 11.3218 16.391 11.4654 16.5346C11.609 16.6782 11.7872 16.75 12 16.75ZM15.8846 16.75C16.0974 16.75 16.2756 16.6782 16.4192 16.5346C16.5628 16.391 16.6346 16.2128 16.6346 16V14C16.6346 13.7872 16.5628 13.609 16.4192 13.4654C16.2756 13.3218 16.0974 13.25 15.8846 13.25C15.6718 13.25 15.4936 13.3218 15.35 13.4654C15.2064 13.609 15.1346 13.7872 15.1346 14V16C15.1346 16.2128 15.2064 16.391 15.35 16.5346C15.4936 16.6782 15.6718 16.75 15.8846 16.75ZM5.3077 20.5C4.80257 20.5 4.375 20.325 4.025 19.975C3.675 19.625 3.5 19.1974 3.5 18.6923V5.3077C3.5 4.80257 3.675 4.375 4.025 4.025C4.375 3.675 4.80257 3.5 5.3077 3.5H18.6923C19.1974 3.5 19.625 3.675 19.975 4.025C20.325 4.375 20.5 4.80257 20.5 5.3077V18.6923C20.5 19.1974 20.325 19.625 19.975 19.975C19.625 20.325 19.1974 20.5 18.6923 20.5H5.3077ZM5.3077 19H18.6923C18.7692 19 18.8397 18.9679 18.9038 18.9038C18.9679 18.8397 19 18.7692 19 18.6923V5.3077C19 5.23077 18.9679 5.16024 18.9038 5.09613C18.8397 5.03203 18.7692 4.99998 18.6923 4.99998H5.3077C5.23077 4.99998 5.16024 5.03203 5.09612 5.09613C5.03202 5.16024 4.99997 5.23077 4.99997 5.3077V18.6923C4.99997 18.7692 5.03202 18.8397 5.09612 18.9038C5.16024 18.9679 5.23077 19 5.3077 19Z" fill="#fa0050"></path></g></g></svg>
                                    </div>
                                    <p className={styles.featuresText}>Monitorea tu desempeño y accede a información valiosa para mejorar las ventas y tener clientes leales.</p>
                                </div>
                                <div className={styles.featuresContainer}>
                                    <div className={styles.featuresIcon}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="chart"><mask id="mask0_8155_943" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect id="Bounding box" width="24" height="24" fill="#D9D9D9"></rect></mask><g mask="url(#mask0_8155_943)"><path id="Icon" d="M8.11538 16.75C8.32819 16.75 8.50639 16.6782 8.64998 16.5346C8.79356 16.391 8.86535 16.2128 8.86535 16V11C8.86535 10.7872 8.79356 10.609 8.64998 10.4654C8.50639 10.3218 8.32819 10.25 8.11538 10.25C7.90256 10.25 7.72436 10.3218 7.58078 10.4654C7.43718 10.609 7.36538 10.7872 7.36538 11V16C7.36538 16.2128 7.43718 16.391 7.58078 16.5346C7.72436 16.6782 7.90256 16.75 8.11538 16.75ZM12 16.75C12.2128 16.75 12.391 16.6782 12.5346 16.5346C12.6782 16.391 12.75 16.2128 12.75 16V7.99998C12.75 7.78716 12.6782 7.60896 12.5346 7.46538C12.391 7.32179 12.2128 7.25 12 7.25C11.7872 7.25 11.609 7.32179 11.4654 7.46538C11.3218 7.60896 11.25 7.78716 11.25 7.99998V16C11.25 16.2128 11.3218 16.391 11.4654 16.5346C11.609 16.6782 11.7872 16.75 12 16.75ZM15.8846 16.75C16.0974 16.75 16.2756 16.6782 16.4192 16.5346C16.5628 16.391 16.6346 16.2128 16.6346 16V14C16.6346 13.7872 16.5628 13.609 16.4192 13.4654C16.2756 13.3218 16.0974 13.25 15.8846 13.25C15.6718 13.25 15.4936 13.3218 15.35 13.4654C15.2064 13.609 15.1346 13.7872 15.1346 14V16C15.1346 16.2128 15.2064 16.391 15.35 16.5346C15.4936 16.6782 15.6718 16.75 15.8846 16.75ZM5.3077 20.5C4.80257 20.5 4.375 20.325 4.025 19.975C3.675 19.625 3.5 19.1974 3.5 18.6923V5.3077C3.5 4.80257 3.675 4.375 4.025 4.025C4.375 3.675 4.80257 3.5 5.3077 3.5H18.6923C19.1974 3.5 19.625 3.675 19.975 4.025C20.325 4.375 20.5 4.80257 20.5 5.3077V18.6923C20.5 19.1974 20.325 19.625 19.975 19.975C19.625 20.325 19.1974 20.5 18.6923 20.5H5.3077ZM5.3077 19H18.6923C18.7692 19 18.8397 18.9679 18.9038 18.9038C18.9679 18.8397 19 18.7692 19 18.6923V5.3077C19 5.23077 18.9679 5.16024 18.9038 5.09613C18.8397 5.03203 18.7692 4.99998 18.6923 4.99998H5.3077C5.23077 4.99998 5.16024 5.03203 5.09612 5.09613C5.03202 5.16024 4.99997 5.23077 4.99997 5.3077V18.6923C4.99997 18.7692 5.03202 18.8397 5.09612 18.9038C5.16024 18.9679 5.23077 19 5.3077 19Z" fill="#fa0050"></path></g></g></svg>
                                    </div>
                                    <p className={styles.featuresText}>Ofrece descuentos y contrata campañas de publicidad para atraer nuevos clientes.</p>
                                </div>
                                <div className={styles.featuresContainer}>
                                    <div className={styles.featuresIcon}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="chart"><mask id="mask0_8155_943" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect id="Bounding box" width="24" height="24" fill="#D9D9D9"></rect></mask><g mask="url(#mask0_8155_943)"><path id="Icon" d="M8.11538 16.75C8.32819 16.75 8.50639 16.6782 8.64998 16.5346C8.79356 16.391 8.86535 16.2128 8.86535 16V11C8.86535 10.7872 8.79356 10.609 8.64998 10.4654C8.50639 10.3218 8.32819 10.25 8.11538 10.25C7.90256 10.25 7.72436 10.3218 7.58078 10.4654C7.43718 10.609 7.36538 10.7872 7.36538 11V16C7.36538 16.2128 7.43718 16.391 7.58078 16.5346C7.72436 16.6782 7.90256 16.75 8.11538 16.75ZM12 16.75C12.2128 16.75 12.391 16.6782 12.5346 16.5346C12.6782 16.391 12.75 16.2128 12.75 16V7.99998C12.75 7.78716 12.6782 7.60896 12.5346 7.46538C12.391 7.32179 12.2128 7.25 12 7.25C11.7872 7.25 11.609 7.32179 11.4654 7.46538C11.3218 7.60896 11.25 7.78716 11.25 7.99998V16C11.25 16.2128 11.3218 16.391 11.4654 16.5346C11.609 16.6782 11.7872 16.75 12 16.75ZM15.8846 16.75C16.0974 16.75 16.2756 16.6782 16.4192 16.5346C16.5628 16.391 16.6346 16.2128 16.6346 16V14C16.6346 13.7872 16.5628 13.609 16.4192 13.4654C16.2756 13.3218 16.0974 13.25 15.8846 13.25C15.6718 13.25 15.4936 13.3218 15.35 13.4654C15.2064 13.609 15.1346 13.7872 15.1346 14V16C15.1346 16.2128 15.2064 16.391 15.35 16.5346C15.4936 16.6782 15.6718 16.75 15.8846 16.75ZM5.3077 20.5C4.80257 20.5 4.375 20.325 4.025 19.975C3.675 19.625 3.5 19.1974 3.5 18.6923V5.3077C3.5 4.80257 3.675 4.375 4.025 4.025C4.375 3.675 4.80257 3.5 5.3077 3.5H18.6923C19.1974 3.5 19.625 3.675 19.975 4.025C20.325 4.375 20.5 4.80257 20.5 5.3077V18.6923C20.5 19.1974 20.325 19.625 19.975 19.975C19.625 20.325 19.1974 20.5 18.6923 20.5H5.3077ZM5.3077 19H18.6923C18.7692 19 18.8397 18.9679 18.9038 18.9038C18.9679 18.8397 19 18.7692 19 18.6923V5.3077C19 5.23077 18.9679 5.16024 18.9038 5.09613C18.8397 5.03203 18.7692 4.99998 18.6923 4.99998H5.3077C5.23077 4.99998 5.16024 5.03203 5.09612 5.09613C5.03202 5.16024 4.99997 5.23077 4.99997 5.3077V18.6923C4.99997 18.7692 5.03202 18.8397 5.09612 18.9038C5.16024 18.9679 5.23077 19 5.3077 19Z" fill="#fa0050"></path></g></g></svg>
                                    </div>
                                    <p className={styles.featuresText}>Mantén tu menú, horarios de apertura y toda la información de tu local actualizada.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.containerRight}>
                    <div className={styles.cotainerForm}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <h3 className={styles.loginTitle}>Inicia sesión con tu usuario</h3>
                            <div className={styles.cotainerInput}>
                                <div className="mb-6">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">Email address</label>
                                    <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="usuario"
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required />
                                </div>
                            </div>
                            <div className={styles.cotainerInput}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                    <input
                                        className="mt-1 block w-full p-2 border border-gray-300 dark:text-black rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Contraseña"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#000" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.containerForgot}>
                                <a href="#" className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
                            </div>
                            <button type="submit" className={styles.loginButton}>Iniciar sesión</button>
                            <div className={styles.containerOr}>
                                <span>O</span>
                            </div>

                            <button type="button" className={styles.phoneLoginButton}>Inicia sesión con número de teléfono</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
