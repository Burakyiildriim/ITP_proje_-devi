import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, getDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  available: boolean;
  description: string;
  coverUrl?: string;
  borrowedBy?: string;
  borrowedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  constructor(private firestore: Firestore) {}

  async getAllBooks(): Promise<Book[]> {
    const booksRef = collection(this.firestore, 'books');
    const snapshot = await getDocs(booksRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Book));
  }

  async searchBooks(query: string): Promise<Book[]> {
    const booksRef = collection(this.firestore, 'books');
    const snapshot = await getDocs(booksRef);
    const books = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Book));

    const searchTerm = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.isbn.toLowerCase().includes(searchTerm)
    );
  }

  async addBook(book: Omit<Book, 'id'>): Promise<void> {
    const booksRef = collection(this.firestore, 'books');
    await addDoc(booksRef, {
      ...book,
      available: true,
      borrowedBy: null,
      borrowedAt: null
    });
  }

  async updateBook(id: string, book: Partial<Book>): Promise<void> {
    const bookRef = doc(this.firestore, 'books', id);
    await updateDoc(bookRef, book);
  }

  async deleteBook(id: string): Promise<void> {
    const bookRef = doc(this.firestore, 'books', id);
    await deleteDoc(bookRef);
  }

  async getUserDoc(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data();
  }

  async borrowBook(bookId: string, userId: string): Promise<void> {
    const bookRef = doc(this.firestore, 'books', bookId);
    const bookDoc = await getDoc(bookRef);
    const bookData = bookDoc.data();

    if (!bookData) {
      throw new Error('Kitap bulunamadı');
    }

    if (!bookData['available']) {
      throw new Error('Kitap şu anda müsait değil');
    }

    await updateDoc(bookRef, {
      available: false,
      borrowedBy: userId,
      borrowedAt: new Date()
    });
  }

  async returnBook(bookId: string): Promise<void> {
    const bookRef = doc(this.firestore, 'books', bookId);
    const bookDoc = await getDoc(bookRef);
    const bookData = bookDoc.data();

    if (!bookData) {
      throw new Error('Kitap bulunamadı');
    }

    if (bookData['available']) {
      throw new Error('Kitap zaten iade edilmiş');
    }

    await updateDoc(bookRef, {
      available: true,
      borrowedBy: null,
      borrowedAt: null
    });
  }
} 