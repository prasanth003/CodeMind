"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'

async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T | null> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation()
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error)
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }
    return null
}

export function useTrafficTracking() {
    const { user } = useAuth()

    // Effect 1: Create initial traffic entry (runs only once on mount)
    useEffect(() => {
        let isCreating = false // Flag to prevent concurrent creation

        const createTrafficEntry = async () => {
            try {
                const trafficDocId = localStorage.getItem('traffic_doc_id')

                // If we have a stored ID, verify it actually exists
                if (trafficDocId) {
                    try {
                        const { getDoc } = await import('firebase/firestore')
                        const docRef = doc(db, "traffic", trafficDocId)
                        const docSnap = await getDoc(docRef)

                        if (docSnap.exists()) {
                            console.log('Traffic doc already exists, skipping creation')
                            return // Doc exists, we're good
                        } else {
                            // Doc doesn't exist, clear the invalid ID
                            console.warn('Stored traffic doc ID is invalid, clearing and creating new entry')
                            localStorage.removeItem('traffic_doc_id')
                            localStorage.removeItem('traffic_email_updated')
                        }
                    } catch (error) {
                        console.warn('Error checking traffic doc, will create new one:', error)
                        localStorage.removeItem('traffic_doc_id')
                        localStorage.removeItem('traffic_email_updated')
                    }
                }

                // If already creating, skip
                if (isCreating) {
                    return
                }

                isCreating = true
                console.log('Creating new traffic doc')

                const result = await retryOperation(async () => {
                    const response = await fetch('https://ipapi.co/json/')
                    const data = await response.json()

                    const docRef = await addDoc(collection(db, "traffic"), {
                        ip: data.ip || '',
                        location: `${data.city}, ${data.region}, ${data.country_name}` || '',
                        email: user?.email || '',
                        timestamp: serverTimestamp(),
                    })

                    return docRef
                })

                if (result) {
                    localStorage.setItem('traffic_doc_id', result.id)
                    if (user?.email) {
                        localStorage.setItem('traffic_email_updated', 'true')
                    }
                }

            } catch (error) {
                console.error("Traffic tracking error:", error)
            } finally {
                isCreating = false
            }
        }

        createTrafficEntry()
    }, []) // Run only once on mount

    // Effect 2: Update email when user logs in (runs when user changes)
    useEffect(() => {
        const updateEmail = async () => {
            try {
                const trafficDocId = localStorage.getItem('traffic_doc_id')
                const emailUpdated = localStorage.getItem('traffic_email_updated')

                // Only update if doc exists, user logged in, and email not yet updated
                if (trafficDocId && user?.email && !emailUpdated) {
                    console.log('Updating traffic doc with email:', user.email)
                    const result = await retryOperation(async () => {
                        const docRef = doc(db, "traffic", trafficDocId)
                        await updateDoc(docRef, {
                            email: user.email
                        })
                        return true
                    })

                    if (result) {
                        localStorage.setItem('traffic_email_updated', 'true')
                    } else {
                        // Update failed (likely doc doesn't exist), clear the invalid ID
                        console.warn('Traffic doc not found, clearing invalid ID')
                        localStorage.removeItem('traffic_doc_id')
                        localStorage.removeItem('traffic_email_updated')
                    }
                }
            } catch (error: any) {
                console.error("Email update error:", error)
                // If document doesn't exist, clear the invalid ID
                if (error?.code === 'not-found' || error?.message?.includes('No document to update')) {
                    console.warn('Traffic doc not found, clearing invalid ID')
                    localStorage.removeItem('traffic_doc_id')
                    localStorage.removeItem('traffic_email_updated')
                }
            }
        }

        updateEmail()
    }, [user?.email]) // Run only when user email changes
}
