import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../../../../components/api-config';
import { XCircle } from 'lucide-react';

interface BookingDetailProps {
	bookingId?: string | null;
	open: boolean;
	onClose: () => void;
}

interface BookingDetail {
	movieName: string;
	theaterName: string;
	image: string;
	duration: string;
	roomName: string;
	showtime: string;
	seatNumbers: string[];
	qrcode?: string;
}

const BookingDetailModal: React.FC<BookingDetailProps> = ({ bookingId, open, onClose }) => {
	const [loading, setLoading] = useState(false);
	const [detail, setDetail] = useState<BookingDetail | null>(null);

	useEffect(() => {
		let mounted = true;
		const fetchDetail = async () => {
			if (!open || !bookingId) return;
			setLoading(true);
			setDetail(null);
			try {
				const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/info`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
				if (!mounted) return;
				if (!res.ok) {
					setDetail(null);
					return;
				}
				const json = await res.json();
				if (json && json.statusCode === 200 && json.data) {
					setDetail(json.data as BookingDetail);
				} else {
					setDetail(null);
				}
			} catch (err) {
				console.error('Error fetching booking detail', err);
				if (mounted) setDetail(null);
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchDetail();

		return () => { mounted = false; };
	}, [open, bookingId]);

		if (!open) return null;

		const isSuccess = !!detail && !loading;

		const formatDateTime = (dt?: string) => {
			if (!dt) return { date: '', time: '' };
			// Expect format: 'YYYY-MM-DD HH:mm:ss' or ISO string
			const parts = dt.split(' ');
			if (parts.length >= 2) {
				const datePart = parts[0];
				const timePart = parts[1].slice(0,5);
				// Convert date to dd/mm/yyyy
				const d = datePart.split('-');
				if (d.length === 3) return { date: `${d[2]}/${d[1]}/${d[0]}`, time: timePart };
				return { date: datePart, time: timePart };
			}
			const dtObj = new Date(dt);
			if (isNaN(dtObj.getTime())) return { date: dt, time: '' };
			return {
				date: dtObj.toLocaleDateString('vi-VN'),
				time: dtObj.toTimeString().slice(0,5)
			};
		};

		return (
					<div className="fixed inset-0 z-50">
						<div className="min-h-screen bg-[var(--color-background)]/70" onClick={onClose}>
					<div className="container mx-auto px-4 py-8 relative z-10">
						  <div className="max-w-7xl mx-auto">
							<div className="flex flex-col items-center justify-center min-h-screen">
								{/* Movie Ticket Design */}
								<div className="relative overflow-hidden rounded-3xl max-w-7xl w-full mx-auto mb-8" onClick={(e) => e.stopPropagation()}>
									<div
										className="relative min-h-[500px] flex"
										style={{
											background: isSuccess ? (detail ? `url('${detail.image}')` : 'var(--color-secondary)') : '#fca5a5',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											backgroundBlendMode: 'overlay'
										}}
									>
										{/* Additional dark overlay for dimmer background */}
										<div className={`absolute inset-0 backdrop-blur-[2px] ${isSuccess ? 'bg-[var(--color-background)]/80' : 'bg-[var(--color-background)]'}`}></div>

										{/* Perforated line separating sections */}
										<div className="absolute left-1/3 top-0 bottom-0 w-6 transform -translate-x-1/2 z-20">

											{/* Perforated dots */}
											<div className="h-full flex flex-col items-center justify-center space-y-4">
												{Array.from({ length: 12 }).map((_, i) => (
													<div key={i} className="w-4 h-4 bg-[var(--color-background)] rounded-full" />
												))}
											</div>
                                        </div>

										{/* Left side - QR Code or Error Message */}
										<div className="w-1/3 p-8 flex flex-col justify-center items-center relative z-10">
											<div className="text-center">
												{loading ? (
													<div className="flex items-center justify-center py-12">
														<div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
													</div>
												) : isSuccess ? (
													<>
														<h3 className="text-white text-lg font-bold mb-8 tracking-wide">MÃ QR CỦA BẠN</h3>
														<div className="rounded-lg shadow-lg inline-block">
															<img src={detail?.qrcode} alt="QR Code" className="w-60 h-60 object-cover rounded-lg" />
														</div>
													</>
												) : (
													<div className="text-center">
														<div className="w-32 h-32 mx-auto mb-6 bg-[var(--color-background)] rounded-full flex items-center justify-center animate-bounce">
															<XCircle className="w-16 h-16 text-white animate-bounce" />
														</div>
													</div>
												)}
											</div>
										</div>

										{/* Right side - Movie info and details */}
										<div className="w-2/3 p-8 flex items-center relative z-10">
											<div className="w-full flex items-center gap-8">
												{/* Booking Information */}
												<div className="flex-1 space-y-6">
													{isSuccess && detail ? (
														<div className="space-y-4">
															<div className="flex justify-between items-center border-b border-white/20 pb-3">
																<span className="text-white/80 text-lg">Người đặt</span>
																<span className="text-white font-bold text-lg">KHÁCH HÀNG</span>
															</div>

															<div className="flex justify-between items-center border-b border-white/20 pb-3">
																<span className="text-white/80 text-lg">Rạp</span>
																<span className="text-white font-bold text-right text-lg">{detail.theaterName}</span>
															</div>

															<div className="flex justify-between items-center border-b border-white/20 pb-3">
																<span className="text-white/80 text-lg">Phim</span>
																<span className="text-white font-bold text-right text-lg">{detail.movieName}</span>
															</div>

															<div className="flex justify-between items-center border-b border-white/20 pb-3">
																<span className="text-white/80 text-lg">Suất chiếu</span>
																<span className="text-white font-bold text-lg">{formatDateTime(detail.showtime).time} {formatDateTime(detail.showtime).date}</span>
															</div>

															<div className="flex justify-between items-center border-b border-white/20 pb-3">
																<span className="text-white/80 text-lg">Số vé</span>
																<span className="text-white font-bold text-2xl">{detail.seatNumbers.length}</span>
															</div>

															<div className="flex justify-between items-center border-b border-white/20 pb-3">
																<span className="text-white/80 text-lg">Ghế</span>
																<span className="text-white font-bold text-lg">{detail.seatNumbers.join(', ')}</span>
															</div>
														</div>
													) : (
														<div className="space-y-4 text-center">
															
														</div>
													)}
												</div>

												{/* Movie Poster - only show on success */}
												{isSuccess && detail && (
													<div className="flex-shrink-0">
														<img src={detail.image} alt={detail.movieName} className="w-72 h-96 object-cover rounded-lg shadow-2xl border-4 border-white/20" />
													</div>
												)}
											</div>
										</div>

										  {/* clicking outside (backdrop) will close modal; interior stops propagation */}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
};

export default BookingDetailModal;

