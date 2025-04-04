import type { KeyData } from './KeyData';
export interface Record {
	id: string;
	keyData?: KeyData;
	password?: string;
	password1?: string;
	password2?: string;
	username?: string;
	floatingTextarea1?: string;
	floatingTextarea2?: string;
}
